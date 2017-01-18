import { TestResult } from "../../imports/api/test-result";
import { ProjectPhases } from "../../imports/api/project-phases";

export default (project) => {
  const results = TestResult.find({project: project._id}).fetch();
  const byPhase = {};

  for (let result of results) {
    if (byPhase[result.phase] === undefined) {
      byPhase[result.phase] = {};
    }
    for (let env in result.environments) {
      let envResult = result.environments[env];
      if (byPhase[result.phase][env] === undefined) {
        byPhase[result.phase][env] = {
          total: 0,
          passed: 0,
          failed: 0,
          retries: 0
        };
      }
      byPhase[result.phase][env].total ++;
      byPhase[result.phase][env].retries += envResult.retryCount;
      if (envResult.status === 'pass') {
        byPhase[result.phase][env].passed ++;
      }
      if (envResult.status === 'fail') {
        byPhase[result.phase][env].failed ++;
      }
    }
  }

  for (let phaseId in byPhase) {
    ProjectPhases.update(phaseId, {"$set":
      {
        "reports.byEnvironment": byPhase[phaseId]
      }
    });
  }
}
