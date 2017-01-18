// Pod Factory
import React from 'react';
import GroupedReport from './grouped-report';
import GroupedReportSummary from './grouped-report-summary';
import StepTimingsAverage from './stepTimings-average';
import StepTimingsByDate from './stepTimings-byDate';

const _lookup = {
  groupedReport: GroupedReport,
  "stepTimings.average": StepTimingsAverage,
  "stepTimings.byDate": StepTimingsByDate,
  "groupedReport.summary": GroupedReportSummary
};

export default (type, data) => {
  if (_lookup[type] && data) {
    return React.createElement(_lookup[type], {data});
  }
  return null;
}
