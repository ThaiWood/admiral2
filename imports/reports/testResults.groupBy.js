import _ from 'lodash';

const _buildReport = (results) => {
  let output = {
    total: 0,
    passed: 0,
    failed: 0,
    retries: 0
  };
  for (result of results) {
    for (let env in result.environments) {
      let envResult = result.environments[env];
      output.total ++;
      output.retries += envResult.retryCount;
      if (envResult.status === 'pass') {
        output.passed ++;
      }
      if (envResult.status === 'fail') {
        output.failed ++;
      }
    }
  }
  return output;
}

export default (params) => {
  return (testResults) => {
    let elligible = _.filter(testResults, (r) => r.attributes && r.attributes[params.key]);
    let groups = _.groupBy(elligible, (r) => r.attributes[params.key]);
    for (var gr in groups) {
      groups[gr] = _buildReport(groups[gr])
    }
    return groups;
  }
};
