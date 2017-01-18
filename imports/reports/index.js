const reportGenerators = {
  'testResults.groupBy': require('./testResults.groupBy').default,
  'stepTimings.average': require('./stepTimings.average').default,
  'stepTimings.byDate': require('./stepTimings.byDate').default
};

export default (genType, params) => {
  if (reportGenerators[genType]) {
    return reportGenerators[genType](params);
  }

  return null;
}
