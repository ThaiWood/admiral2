import _ from 'lodash';
var stats = require("stats-lite");

export default (params) => {
  return (testResults, testRuns) => {
    return testRuns.map((tr) => {
      return {
        date: tr.created,
        timings: tr.stepTimesElapsed
      };
    }).sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      } if (a.date > b.date) {
        return 1;
      }
      return 0;
    });
  }
};
