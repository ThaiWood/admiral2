import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Projects } from '../../imports/api/projects';
import { RecentTestListContainer } from '../components/recent-test-runs';

export class ProjectsList extends React.Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-8">
            <h1>Projects</h1>
            {this.props.projects.map((project, index) => (
              <div key={index}>
                <a href={`/project/${project.name}`}>{project.name}</a>
              </div>
            ))}
          </div>
          <div className="col-md-4">
            <h1>Recent</h1>
            <RecentTestListContainer />
          </div>
        </div>
      </div>
    );
  }
}

export const ProjectsListContainer = createContainer(() => {
  return {
    projects: Projects.find({}).fetch(),
  };
}, ProjectsList);
