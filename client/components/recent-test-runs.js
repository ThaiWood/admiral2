import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { ProjectLink, PhaseLink } from './links';
import { TestRun } from '../../imports/api/test-run';
import moment from 'moment';

export class RecentTestList extends React.Component {
  render() {
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Run</th>
          </tr>
        </thead>
        <tbody>
          {this.props.runs.map((run, index) => (
            <tr key={index} className="recent-run">
              <td>
                {moment(run.created).format('M/D/YY - h:mm a')}
              </td>
              <td>
                <div className="project">
                  <ProjectLink project={run.project_name}/> |&nbsp;
                  <PhaseLink project={run.project_name} phase={run.phase_name} />
                </div>
                <div className="run">
                  <a href={`/run/${run._id}`}>{run.name||run._id}</a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export const RecentTestListContainer = createContainer(({}) => {
  return {
    runs: TestRun.find({}, {sort: {created: -1}, limit: 5}).fetch()
  };
}, RecentTestList);
