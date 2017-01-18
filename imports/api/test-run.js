import { Mongo } from 'meteor/mongo';
import { Projects } from './projects';
import { ProjectPhases } from './project-phases';
import setBuilder from '../utilities/mongo-set-builder';
import { createDates, updateDates } from '../utilities/date-handler';

const TestRun = new Mongo.Collection('test_run');

TestRun.start = (project, phase, data) => {
  const info = ProjectPhases.findPhase(project, phase);
  createDates(data);
  data.status = "running";
  data.project = info.project._id;
  data.project_name = project;
  data.phase = info.phase._id;
  data.phase_name = phase;
  data.start = data.created;
  data.stepTimes = {};
  data.metric = data.metric || {};
  return TestRun.insert(data);
}

TestRun.updateById = (_id, data) => {
  const run = TestRun.findOne({_id});
  if (run) {
    let setObj = {};
    updateDates(data);
    setBuilder(data, setObj, '');
    TestRun.update(run._id, {"$set": setObj});
    return TestRun.findOne({_id});
  } else {
    throw "Test run not found";
  }
}

export { TestRun };
