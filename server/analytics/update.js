import updateWorstTests, { updateScore } from "./worst-tests";
import updateEnvironmentsByPhase from "./environments-by-phase";

import { Projects } from '../../imports/api/projects';
import { ProjectPhases } from "../../imports/api/project-phases";
import { TestRun } from "../../imports/api/test-run";
import { TestResult } from "../../imports/api/test-result";

import reportGenerator from "../../imports/reports";

const _updateReports = (pods, results, runs, reports) => {
  for (const k in pods) {
    let reportGen = reportGenerator(pods[k].data.type, pods[k].data.params);
    if (reportGen) {
      let report = reportGen(results, runs)
      reports[k] = report;
    }
  }
}

export default (project, phase, run) => {
  // updateWorstTests(project);
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
