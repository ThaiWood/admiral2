import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';

import { ProjectLink } from '../components/links';
import { Projects } from '../../imports/api/projects';
import { ProjectPhases } from '../../imports/api/project-phases';
import { TestRun } from '../../imports/api/test-run';
import PodFactory from '../pods';
import ProgressBar from '../components/progress-bar';

import _ from 'lodash';
import Environment from '../components/environment';

const TestList = (props) => (
  <div>
    {props.tests.map((test, index) => (
      <div key={index}>{test.test}</div>
    ))}
  </div>
);

export class TestRunList extends React.Component {
  _runPods(run) {
    const pods = [];
    for (let pk in run.pods || {}) {
      const pod = run.pods[pk];
      if (pod.summary !== undefined && run.reports) {
        let podElement = PodFactory(
          pod.summary.type,
          run.reports[pk]
        );
        if (podElement) {
          pods.push(podElement);
        }
      }
    }
    return pods;
  }

  _testRuns() {
    return (
      <div>
        <h2>Test Runs</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Run</th>
            </tr>
          </thead>
          <tbody>
            {this.props.runs.map((run, index) => (
              <tr key={index}>
                <td>
                  {moment(run.created).format('M/D/YY - h:mm a')}
                </td>
                <td>
                  <a href={`/run/${run._id}`}>{run.name||run._id}</a>
                  {this._runPods(run)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  _worstTests() {
    return this.props.project && this.props.project.worstTests ? (
      <div className="well">
        <h2>Worst Tests</h2>
        <TestList tests={this.props.project.worstTests} />
      </div>
    ) : null;
  }

  _byEnvironment() {
    let rows = null;
    if (this.props.phaseObject && this.props.phaseObject.reports && this.props.phaseObject.reports.byEnvironment) {
      rows = [];
      for (let env in this.props.phaseObject.reports.byEnvironment) {
        let envResult = this.props.phaseObject.reports.byEnvironment[env];
        if (envResult.total > 0) {
          rows.push({
            environment: env,
            passed: Math.floor((parseFloat(envResult.passed) / parseFloat(envResult.total)) * 100.00),
            retryPercent: Math.floor((parseFloat(envResult.retries) / parseFloat(envResult.total)) * 100.0)
          });
        }
      }

      rows = _.sortBy(rows, 'sortKey');
    }
    return rows ? (
      <div className="well well-sm">
        <h2>Breakdown By Environment</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Environment</th>
              <th>Pass %</th>
              <th>Retry %</th>
            </tr>
          </thead>
          <tbody style={{background: 'white'}}>
            {rows.map((row, index) => (
              <tr key={`env-${row.environment}`}>
                <td>
                  <Environment environment={row.environment} />
                </td>
                <td>
                  <ProgressBar percent={row.passed} />
                </td>
                <td>
                  <ProgressBar percent={row.retryPercent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null;
  }

  _renderPods() {
    const pods = [];
    for (var pod in this.props.phaseObject.pods) {
      let podElement = PodFactory(
        this.props.phaseObject.pods[pod].view.type,
        this.props.phaseObject.reports[pod]
      );
      if (podElement) {
        pods.push({
          view: this.props.phaseObject.pods[pod].view,
          element: podElement
        });
      }
    }
    return pods.map((pod) => (
      <div className="well">
        {pod.view.title ? <h2>{pod.view.title}</h2> : null}
        {pod.element}
      </div>
    ));
  }

  render() {
    const pods = [];
    pods.push(this._testRuns());
    if (this.props.phaseObject && this.props.phaseObject.pods && this.props.phaseObject.reports) {
      for (pod of this._renderPods()) {
        pods.push(pod);
      }
    }
    pods.push(this._byEnvironment());
/*
pods.push(this._worstTests());
*/
    return (
      <div>
        <h1><ProjectLink project={this.props.projectName}/> | {this.props.phase}</h1>
        {_.chunk(pods, 3).map((pg, pgIndex) => (
          <div className="row" key={`pgIndex-${pgIndex}`}>
            {pg.map((pod, podIndex) => (
              <div className="col-md-4" key={`pgIndex-${pgIndex}-${podIndex}`}>
                {pod}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export const TestRunListContainer = createContainer(({ project, phase }) => {
  return {
    projectName: project,
    project: Projects.findOne({name: project}),
    phaseObject: ProjectPhases.findOne({name: phase}),
    runs: TestRun.find({project_name: project, phase_name: phase}, {sort: {created: -1}, limit: 15}).fetch()
  };
}, TestRunList);
