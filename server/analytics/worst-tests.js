import { TestResult } from "../../imports/api/test-result";
import { Projects } from '../../imports/api/projects';

var stats = require("stats-lite");

export const createScore = (result) => {
  let score = 0;
  let envCount = 0;
  for (var k in result.environments) {
    score += result.environments[k].status === 'fail' ? 3 : 0;
    score += result.environments[k].status === 'pass' ? result.environments[k].retryCount * 0.2 : 0;
    envCount++;
  }
  result.score = score;
  result.normalizedScore = envCount > 0 ? parseFloat(score) / parseFloat(envCount) : 0;
};

export const updateScore = (id) => {
  const result = TestResult.findOne({_id: id});
  result.environments = result.environments || {};
  createScore(result);
  TestResult.update(result._id, {"$set": {
    score: result.score,
    normalizedScore: result.normalizedScore
  }});
  return result;
}

export default (project) => {
  const results = TestResult.find({project: project._id}).fetch();
  const scores = [];

  const scoreSets = {};
  for (let result of results) {
    createScore(result);
    TestResult.update(result._id, {"$set": {
      score: result.score,
      normalizedScore: result.normalizedScore
    }});
    scores.push(result.score);
    if (scoreSets[result.test] === undefined) {
      scoreSets[result.test] = {
        test: result.test,
        scores: [],
        stdevs: []
      };
    }
    scoreSets[result.test].scores.push(result.score);
  }

  const mean = stats.mean(scores);
  const stddev = stats.stdev(scores);
  for (let result of results) {
    scoreSets[result.test].stdevs.push((result.score - mean) / stddev);
  }

  let worstTests = [];

  for (let k in scoreSets) {
    scoreSets[k].overall = {
      mean: stats.mean(scoreSets[k].scores),
      stddev: stats.stdev(scoreSets[k].scores),
    };
    if (scoreSets[k].overall.stddev > 1) {
      worstTests.push(scoreSets[k]);
    }
  }

  worstTests = worstTests.sort((a, b) => {
    if (a.overall.stddev < b.overall.stddev) {
      return -1;
    } else if (a.overall.stddev > b.overall.stddev) {
      return 1;
    } else {
      return 0;
    }
  }).slice(worstTests.length < 5 ? 0 : worstTests.length - 5);

  project.testScores = scoreSets;
  project.worstTests = worstTests;
  const update = {"$set":
    {
      testScores: project.testScores,
      worstTests: project.worstTests
    }
  };
  Projects.update(project._id, update);
}
