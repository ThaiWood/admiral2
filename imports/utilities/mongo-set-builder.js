import _ from 'lodash';

const setBuilder = (input, out, parent = '') => {
  for (var k in input) {
    if (_.isPlainObject(input[k])) {
      setBuilder(input[k], out, `${parent}${k}.`);
    } else {
      out[`${parent ? parent : ''}${k}`] = input[k];
    }
  }
}

export default setBuilder;
