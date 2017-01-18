import React from 'react';
import { enviornmentIcon, enviornmentVersion, enviornmentWidth } from '../utilities/environments';

export default (props) => (
  <span>
    <i className={`fa ${enviornmentIcon(props.environment)}`} /> {enviornmentVersion(props.environment)} {enviornmentWidth(props.environment)}
  </span>
);
