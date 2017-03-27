import { Mongo } from 'meteor/mongo';
import { TestRun } from './test-run';
import setBuilder from '../utilities/mongo-set-builder';
import { createDates, updateDates } from '../utilities/date-handler';

const TestResult = new Mongo.Collection('test_result');

TestResult.createOrUpdate = (run, data, postProcess) => {
  if (!data || !data.test) {
    throw "No test specified";
  }

  const testRun = TestRun.findOne({_id: run});
  if (!testRun) {
    throw "Invalid test run";
  }

  const result = TestResult.findOne({
    run: testRun._id,
    test: data.test
  });

  if (result) {
    updateDates(data);
    const setObj = {};
    setBuilder(data, setObj, '');

    TestResult.update(result._id, {"$set": setObj});

    if (postProcess) postProcess(result);

    return TestResult.findOne({_id: result._id});
  } else {
    createDates(data);
    data.run = testRun._id;
    data.run_start = testRun.start;
    data.run_name = testRun.name;
    data.project = testRun.project;
    data.project_name = testRun.project_name;
    data.phase = testRun.phase;
    data.phase_name = testRun.phase_name;

    const newId = TestResult.insert(data);

    data._id = newId;

    if (postProcess) postProcess(data);

    return data;
  }
}

export { TestResult };
