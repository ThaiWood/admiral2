import _ from 'lodash';

const _safeDate = (date) => {
  if (_.isDate(date)) {
    return date;
  } if (date) {
    try {
      return new Date(Date.parse(date));
    } catch(e) {
      return new Date();
    }
  } else {
    return new Date();
  }
}

export const createDates = (data) => {
  data.created = _safeDate(data.created);
  data.updated = _safeDate(data.updated);
};

export const updateDates = (data) => {
  data.updated = _safeDate(data.updated);
};
