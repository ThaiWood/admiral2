// For reasons I don't quite understand the 2.0.x API is not compatible with this setup,
// even when I invoke it properly. It's possible it's conflicting with the meteor oplog
// monitoring. But the 1.0.x works to monitor the Magellan traffic.
import MongoOplog from 'mongo-oplog';

import MongoDB from 'mongodb';
import SuiteRunResult from 'testarmada-manifest';
import StatsD from 'hot-shots';

import { Projects } from '../../imports/api/projects';
import { ProjectPhases } from "../../imports/api/project-phases";
import { TestRun } from "../../imports/api/test-run";
import { TestResult } from "../../imports/api/test-result";

import { Meteor } from 'meteor/meteor';

import { updateScore } from "../analytics/worst-tests";

import url from "url";

import updateAnalytics from "../analytics/update";

const statsdClient = new StatsD({
  host: 'localhost',
  telegraf: true,
  port: 8126
});

statsdClient.socket.on('error', function(error) {
  console.error("Error in socket: ", error);
});

const srrs = {};
const runIds = {};

let oplog = null;

let pingCollection = null;
let currentPing = null;
let currentPingReturned = 0;

const firePing = () => {
  currentPing = (new Date()).getTime();
  pingCollection.insert({d: currentPing});
  currentPingReturned = 0;
  setTimeout(() => {
    pingCheck();
  }, 1000);
};

const pingReturn = (data) => {
  if (data.d === currentPing) {
    currentPingReturned = (new Date()).getTime() - currentPing;
  }
}

const pingCheck = () => {
  statsdClient.timing("mongo_ping", currentPingReturned, (err) => {
    // console.log("Called back", err);
  });
  // console.log(currentPing, currentPingReturned);
  pingCollection.deleteOne({d: currentPing});
  firePing();
};

// Not quite sure why we have to do this `Meteor.setTimeout` thing. Without it you get issues
// around Fibers. So apparently, running synchronous stuff outside of a route? Not sure.
const _queue = [];
const watchQueue = () => {
  while(_queue.length > 0) {
    const msg = _queue.shift();
    const purl = url.parse(msg.project).path;
    const projectName = purl.match(/\/([^/]*?)$/)[1];
    const job = [msg.project, msg.phase, msg.run].join('::');

    const project = Projects.findOrCreate(projectName, {});
    const phase = ProjectPhases.findOrCreate(project._id, msg.phase, {});
    if (runIds[job] === undefined) {
      runIds[job] = TestRun.start(projectName, msg.phase, {
        name: msg.displayName,
        buildURL: msg.buildURL,
        shardBuildURL: msg.shardBuildURL
      });
    }

    if (job && srrs[job] === undefined) {
      const srr = new SuiteRunResult();
      srr.on("testRunEnd", (testRun) => {
        const environments = {};
        environments[testRun.environment.id] = {
          status: testRun.passed ? 'pass' : 'fail',
          retryCount: testRun.attemptNumber - 1
        };
        const testResult = {
          test: testRun.test.name,
          environments
        };
        if (testRun.metadata && testRun.metadata.sauceURL) {
          testResult.sauceURL = testRun.metadata.sauceURL;
        }
        TestResult.createOrUpdate(runIds[job], testResult, (data) => updateScore(data._id));

        updateAnalytics(
          project,
          phase,
          TestRun.findOne({_id: runIds[job]})
        );
      });
      srr.on("testRunStart", (testRun) => {
        const environments = {};
        environments[testRun.environment.id] = {
          status: 'started',
          retryCount: testRun.attemptNumber - 1
        };
        const testResult = {
          test: testRun.test.name,
          environments
        };
        TestResult.createOrUpdate(runIds[job], testResult);
      });
      srr.on("end", () => {
        TestRun.updateById(runIds[job], {status: "finished"});
      });
      srrs[job] = srr;
    }

    if (srrs[job]) {
      if (msg.type === "testRun") {
        srrs[job].testRunMessage(msg.testRun, msg.test, msg.message);
      } else {
        srrs[job].globalMessage(msg.message);
      }
    }
  }

  Meteor.setTimeout(watchQueue, 100);
};

export default {
  initialize: () => {
    const host = process.env.MAGELLAN_MONGO_HOST;

    if (host) {
      const user = process.env.MAGELLAN_MONGO_USER;
      const password = process.env.MAGELLAN_MONGO_PASSWORD;
      const db = "admin";

      const auth = (user && password) ? `${user}:${password}@` : '';
      const mongoUrl = `mongodb://${auth}${host}:27017/${db}`;
      oplog = MongoOplog(mongoUrl, { ns: `${db}.*` }).tail();

      Meteor.setTimeout(watchQueue, 100);

      MongoDB.MongoClient.connect(mongoUrl, (err, db) => {
        pingCollection = db.collection('ping');
        firePing();
      });

      oplog.on('op', (data) => {
        if (data.ns === `${db}.ping`) {
          if (data.op === 'i') {
            pingReturn(data.o);
          }
        } else {
          if (data.o.project && data.o.phase && data.o.run) {
            _queue.push(data.o);
          }
        }
      });
    }
  }
};
