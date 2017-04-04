import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';

import ResultTable from '../components/result-table';

import { Projects } from '../../imports/api/projects';
import { TestRun } from '../../imports/api/test-run';
import { TestResult } from '../../imports/api/test-result';
import Environment from '../components/environment';
import human from 'human-time';

export class IndividualResultDetail extends React.Component {
  _resultTable() {
    return (
      <ResultTable
        results={[this.props.result]}
        project={this.props.project}
        headerElements={[
          <td width="10%">Phase</td>,
          <td width="25%">Run</td>,
          <td width="15%">Date</td>
        ]}
        browserColumnWidth={10}
        indexGenerator={(result) => result.run_start}
        rowElements={(result) => {
          return [
            <td>{result.phase_name}</td>,
            <td>{result.run_name}</td>,
            <td>{moment(result.run_start).format('M/D/YY - h:mm a')}</td>
          ];
        }}
        />
    );
  }
  render() {
    let envResult = {};
    if (this.props.result && this.props.environment) {
      envResult = this.props.result.environments[this.props.environment];
    }
    if (!envResult) {
      envResult = {};
    }
    console.log("====>", envResult)
    return (
      <div>
        {this.props.project && this.props.result ? this._resultTable() : null }
        <h2>Information</h2>
        <table className="table table-striped">
          <tbody>
            <tr>
              <td width="20%">
                Run	Job
              </td>
              <td>
                #693
              </td>
            </tr>
            <tr>
              <td>
                Run
              </td>
              <td>
                #38974
              </td>
            </tr>
            <tr>
              <td>
                UA ID
              </td>
              <td>
                <Environment environment={this.props.environment} />
              </td>
            </tr>
            <tr>
              <td>
                Started
              </td>
              <td>
                {human(Math.floor((new Date() - this.props.result.created) / 1000.0))}
              </td>
            </tr>
          </tbody>
        </table>
        <h2>Results</h2>
        <table className="table table-striped">
          <tbody>
            <tr>
              <td width="20%">
                CI Link
              </td>
              <td>
                <a href={envResult.resultURL}>{envResult.resultURL}</a>
              </td>
            </tr>
            <tr>
              <td>
                Remote Link
              </td>
              <td>
                <a href={envResult.sauceURL}>{envResult.sauceURL}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export const IndividualResultDetailContainer = createContainer(({ resultId, environment }) => {
  const resultObj = TestResult.findOne({_id: resultId});
  let project = null;
  let testRun = {};
  if (resultObj) {
    project = Projects.findOne(resultObj.project);
    testRun = TestRun.findOne(resultObj.run);
  }
  return {
    result: resultObj || {
      environments: {},
      created: new Date()
    },
    project: project,
    testRun: testRun,
    environment
  };
}, IndividualResultDetail);
