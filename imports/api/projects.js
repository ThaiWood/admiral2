import { Mongo } from 'meteor/mongo';
import { createDates } from '../utilities/date-handler';

const Projects = new Mongo.Collection('projects');

Projects.findByName = (name) => Projects.findOne({name});

Projects.findByID = (_id) => Projects.findOne({_id});

Projects.findOrCreate = (name, data = {}) => {
  const found = Projects.findByName(name);
  if (found) {
    return found;
  } else {
    createDates(data);
    data.name = name;
    const project = Projects.insert(data);
    return {_id: project};
  }
};

export { Projects };
