import _ from 'lodash';
var stats = require("stats-lite");

export default (params) => {
  return (testResults, testRuns) => {
    const averages = {};
    for (let run of testRuns) {
      if (run.stepTimesElapsed) {
        for (let k in run.stepTimesElapsed) {
          if (averages[k] === undefined) {
            averages[k] = [];
          }
          averages[k].push(run.stepTimesElapsed[k]);
        }
      }
    }

    for (let k in averages) {
      averages[k] = stats.mean(averages[k]);
    }

    if (averages.start !== undefined && averages.end !== undefined) {
      averages['test-run'] = averages.start + averages.end;
    }

    return averages;
  }
};
