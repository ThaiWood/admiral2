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
            <tr>
              <td>
                Build URL
              </td>
              <td>
                <a href="http://jenkins.otto.walmartlabs.com:8080/job/Core/job/electrode_magellan_test_shard/14242/">
                  http://jenkins.otto.walmartlabs.com:8080/job/Core/job/electrode_magellan_test_shard/14242/
                </a>
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
        <p className="swarm-toollinks">
          <a href="https://saucelabs.com/tests/fb213bd74ee4405fb285443f617593cc" target="_blank">
            Open in new window
          </a>
        </p>
        <iframe
          src="https://saucelabs.com/tests/fb213bd74ee4405fb285443f617593cc" width="100%" height="1200px"
          className="swarm-result-frame">
        </iframe>
      </div>
    );
  }
}

export const IndividualResultDetailContainer = createContainer(({ resultId }) => {
  const resultObj = TestResult.findOne({_id: resultId});
  let project = null;
  if (resultObj) {
    project = Projects.findOne(resultObj.project);
  }
  return {
    result: resultObj || {
      created: new Date()
    },
    project: project
  };
}, IndividualResultDetail);
