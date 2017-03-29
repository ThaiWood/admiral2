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
          <td width="20%">Phase</td>,
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
    return (
      <div>
        {this.props.project && this.props.result ? this._resultTable() : null }
        <h2>Information</h2>
        <table className="table table-striped">
          <tbody>
            <tr>
              <td>
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
            {this.props.result.sauceURL ? (
              <tr>
                <td>
                  Remote URL
                </td>
                <td>
                  <a href="https://saucelabs.com/tests/fb213bd74ee4405fb285443f617593cc">
                    https://saucelabs.com/tests/fb213bd74ee4405fb285443f617593cc
                  </a>
                </td>
              </tr>
            ) : null}
            {this.props.testRun.buildURL ? (
              <tr>
                <td>
                  Build URL
                </td>
                <td>
                  <a href={this.props.testRun.buildURL}>
                    {this.props.testRun.buildURL}
                  </a>
                </td>
              </tr>
            ) : null}
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
        {this.props.result.sauceURL ? (
          <p className="swarm-toollinks">
            <a href={this.props.result.sauceURL} target="_blank">
              Open in new window
            </a>
          </p>
        ) : null}
        {this.props.result.sauceURL ? (
          <iframe
            src={this.props.result.sauceURL} width="100%" height="1200px"
            className="swarm-result-frame">
          </iframe>
        ) : null}
      </div>
    );
  }
}

export const IndividualResultDetailContainer = createContainer(({ resultId }) => {
  const resultObj = TestResult.findOne({_id: resultId});
  let project = null;
  let testRun = {};
  if (resultObj) {
    project = Projects.findOne(resultObj.project);
    testRun = TestRun.findOne(resultObj.run);
  }
  return {
    result: resultObj || {
      created: new Date()
    },
    project: project,
    testRun: testRun
  };
}, IndividualResultDetail);
