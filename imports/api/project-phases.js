import { Mongo } from 'meteor/mongo';
import { Projects } from './projects';
import { createDates } from '../utilities/date-handler';
import setBuilder from '../utilities/mongo-set-builder';

const ProjectPhases = new Mongo.Collection('project_phases');

ProjectPhases.findByName = (project, name) => ProjectPhases.findOne({project, name});

ProjectPhases.findOrCreate = (project, name, data = {}) => {
  const phase = ProjectPhases.findByName(project, name);
  if (phase) {
    return phase;
  } else {
    createDates(data);
    data.project = project;
    data.project_name = Projects.findByID(project).name;
    data.name = name;
    return {_id: ProjectPhases.insert(data)};
  }
};

ProjectPhases.updateById = (_id, data) => {
  const setObj = {};
  setBuilder(data, setObj, '');
  ProjectPhases.update(_id, {"$set": setObj});
  return ProjectPhases.findOne({_id});
};

ProjectPhases.findPhase = (prName, phName) => {
  const project = Projects.findByName(prName);
  if (!project) {
    throw "Bad project name";
  }
  const phase = ProjectPhases.findByName(project._id, phName);
  if (!phase) {
    throw "Bad phase name";
  }
  return {
    project,
    phase
  };
}

export { ProjectPhases };
