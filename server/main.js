import { Meteor } from 'meteor/meteor';
import { CollectionAPI } from 'meteor/xcv58:collection-api';
import { WebApp } from 'meteor/webapp';
import { RoutePolicy } from 'meteor/routepolicy';
import { Router } from 'meteor/iron:router';

import { Projects } from '../imports/api/projects';
import { ProjectPhases } from "../imports/api/project-phases";
import { TestRun } from "../imports/api/test-run";
import { TestResult } from "../imports/api/test-result";

import reportGenerator from "../imports/reports";

import setBuilder from '../imports/utilities/mongo-set-builder';

import updateWorstTests, { updateScore } from "./analytics/worst-tests";
import updateEnvironmentsByPhase from "./analytics/environments-by-phase";

import moment from 'moment';
import _ from 'lodash';

import magellanListener from './listeners/magellan';

magellanListener.initialize();

const _updateReports = (pods, results, runs, reports) => {
  for (const k in pods) {
    let reportGen = reportGenerator(pods[k].data.type, pods[k].data.params);
    if (reportGen) {
      let report = reportGen(results, runs)
      reports[k] = report;
    }
  }
}

const _updateAnalytics = (project, phase, run) => {
  updateWorstTests(project);
  updateEnvironmentsByPhase(project);

  if (phase && phase.pods) {
    const results = TestResult.find({phase: phase._id}).fetch();
    const runs = TestRun.find({phase: phase._id}).fetch();
    phase.reports = phase.reports || {};
    _updateReports(phase.pods, results, runs, phase.reports);
    ProjectPhases.update(phase._id, {"$set": {reports: phase.reports}});
  }

  if (run && run.pods) {
    const results = TestResult.find({run: run._id}).fetch();
    const runs = TestRun.find({phase: phase._id}).fetch();
    run.reports = run.reports || {};
    _updateReports(run.pods, results, runs, run.reports);
    TestRun.update(run._id, {"$set": {reports: run.reports}});
  }
}

const _jsonResponse = (res, data) => {
  const body = JSON.stringify(data);
  res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
  res.setHeader('Content-Type', 'application/json');
  res.write(body);
  res.end();
}

const _findPhase = (prName, phName, res) => {
  try {
    return ProjectPhases.findPhase(prName, phName);
  } catch(e) {
    _jsonResponse(res, {error: e.toString()});
    return null;
  }
}

Meteor.startup(() => {
  ProjectPhases._ensureIndex({ "project": 1 });
  TestRun._ensureIndex({ "project": 1, "phase": 1 });
  TestResult._ensureIndex({ "run": 1 });

  // Gets all the projects
  Router.route('/api/reset', {where: 'server'})
    .post(function () {
      Projects.remove({});
      ProjectPhases.remove({});
      TestRun.remove({});
      TestResult.remove({});
      _jsonResponse(this.response, {reset: true});
    })

  // Gets all the projects
  Router.route('/api/project', {where: 'server'})
    .get(function () {
      const rows = Projects.find({}).fetch();
      _jsonResponse(this.response, rows);
    });

  // Gets project info
  Router.route('/api/project/:project', {where: 'server'})
    .post(function () {
      _jsonResponse(this.response, Projects.findOrCreate(
        this.params.project,
        this.request.body || {}
      ));
    })
    .get(function () {
      const found = Projects.findByName(this.params.project);
      _jsonResponse(this.response, found ? found : null);
    });

  // Gets project info
  Router.route('/api/project/:project/analytics', {where: 'server'})
    .post(function () {
      let project = Projects.findByName(this.params.project);
      _updateAnalytics(project);
      project = Projects.findByName(this.params.project);
      _jsonResponse(this.response, project);
    });

  // Gets the phase info
  Router.route('/api/project/:project/:phase', {where: 'server'})
    .put(function() {
      try {
        const phase = ProjectPhases.findPhase(this.params.project, this.params.phase);
        _jsonResponse(this.response, ProjectPhases.updateById(
          phase.phase._id, this.request.body || {})
        );
      } catch(e) {
        _jsonResponse(this.response, {error: e});
      }
    })
    .get(function () {
      try {
        const phase = ProjectPhases.findPhase(this.params.project, this.params.phase);
        _jsonResponse(this.response, phase ? phase.phase : null);
      } catch(e) {
        _jsonResponse(this.response, {error: e});
      }
    })
    .post(function () {
      const project = Projects.findByName(this.params.project);
      if (!project) {
        _jsonResponse(this.response, {error: "Bad project name"});
        return;
      }

      _jsonResponse(this.response, ProjectPhases.findOrCreate(
        project._id, this.params.phase, this.request.body || {})
      );
    });

  // Gets project info
  Router.route('/api/project/:project/:phase/analytics', {where: 'server'})
    .post(function () {
      _updateAnalytics(
        Projects.findByName(this.params.project),
        _findPhase(this.params.project, this.params.phase, this.response).phase
      );
      _jsonResponse(this.response,
        _findPhase(this.params.project, this.params.phase, this.response).phase
      );
    });

  // Adds a test run
  Router.route('/api/project/:project/:phase/run', {where: 'server'})
    .post(function () {
      try {
        _jsonResponse(this.response, {
          _id: TestRun.start(this.params.project, this.params.phase, this.request.body || {})
        });
      } catch(e) {
        console.log(e);
        _jsonResponse(this.response, {error: e});
      }
    });

  // Updates a test run
  Router.route('/api/project/:project/:phase/run/:run', {where: 'server'})
    .put(function () {
      try {
        _jsonResponse(this.response,
          TestRun.updateById(this.params.run, this.request.body || {})
        );
      } catch(e) {
        console.log(e);
        _jsonResponse(this.response, {error: e});
      }
    });

  // Finishes the run
  Router.route('/api/project/:project/:phase/run/:run/finish', {where: 'server'})
    .post(function () {
      try {
        const run = TestRun.updateById(this.params.run, _.merge(this.request.body, {
          status: "finished"
        }));
        _updateAnalytics(
          Projects.findByName(this.params.project),
          _findPhase(this.params.project, this.params.phase, this.response).phase
        );
        _jsonResponse(this.response, run);
      } catch(e) {
        console.log(e);
        _jsonResponse(this.response, {error: e});
      }
    });

  // Updates analytics on the run
  Router.route('/api/project/:project/:phase/run/:run/analytics', {where: 'server'})
    .post(function () {
      try {
        _updateAnalytics(
          Projects.findByName(this.params.project),
          _findPhase(this.params.project, this.params.phase, this.response).phase,
          TestRun.findOne({_id: this.params.run})
        );
        _jsonResponse(this.response, TestRun.findOne({_id: this.params.run}));
      } catch(e) {
        console.log(e);
        _jsonResponse(this.response, {error: e});
      }
    });

  // Sets the run step
  Router.route('/api/project/:project/:phase/run/:run/step', {where: 'server'})
    .post(function () {
      try {
        let stepDate = new Date();
        if (this.request.body && this.request.body.updated) {
          try {
            stepDate = new Date(Date.parse(this.request.body.updated));
          } catch(e) {
            stepDate = new Date();
          }
        }
        let setObj = this.request.body || {};
        setObj.step = this.params.query.step;
        setObj.stepTimes = {};
        setObj.stepTimes[this.params.query.step] = stepDate;

        setObj.stepTimesElapsed = {};
        const project = Projects.findByName(this.params.project);
        const run = TestRun.findOne({_id: this.params.run});
        let lastTime = new Date(Date.parse(run.start));
        const times = {};
        for (var i in project.steps) {
          if (project.steps[i].id === this.params.query.step) {
            setObj.stepTimesElapsed[this.params.query.step] = stepDate - lastTime;
          }
          let currentTime = run.stepTimes[project.steps[i].id];
          if (currentTime) {
            lastTime = currentTime;
          }
        }

        _jsonResponse(this.response,
          TestRun.updateById(this.params.run, setObj)
        );
      } catch(e) {
        console.log(e);
        console.log(e.stack);
        _jsonResponse(this.response, {error: e});
      }
    });

  // Sets a metric value
  Router.route('/api/project/:project/:phase/run/:run/metric', {where: 'server'})
    .post(function () {
      try {
        let setObj = this.request.body || {};
        setObj.metric = {};
        setObj.metric[this.params.query.metric] = this.params.query.value;
        _jsonResponse(this.response,
          TestRun.updateById(this.params.run, setObj)
        );
      } catch(e) {
        console.log(e);
        console.log(e.stack);
        _jsonResponse(this.response, {error: e});
      }
    });

  Router.route('/api/result/:run', {where: 'server'})
    .post(function () {
      try {
        _jsonResponse(this.response,
          TestResult.createOrUpdate(this.params.run, this.request.body || {}, (data) => updateScore(data._id))
        );
      } catch(e) {
        console.log(e);
        console.log(e.stack);
        _jsonResponse(this.response, {error: e});
      }
    });

  collectionApi = new CollectionAPI({
    authToken: undefined,
    apiPath: 'rest',
    standAlone: false,
    allowCORS: true,
    sslEnabled: false,
    listenPort: 3005,
    listenHost: undefined
  });

  collectionApi.addCollection(Projects, 'projects', {methods: ['GET']});
  collectionApi.addCollection(ProjectPhases, 'projectPhases', {methods: ['GET']});
  collectionApi.addCollection(TestRun, 'testRuns', {methods: ['GET']});
  collectionApi.addCollection(TestResult, 'testResult', {methods: ['GET']});

  // Starts the API server
  collectionApi.start();
});
