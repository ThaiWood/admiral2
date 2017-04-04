import React from 'react';
import { browserIcon, browserVersion, enviornmentWidth } from '../utilities/environments';

export default (props) => (
  <span>
    <i className={`fa ${browserIcon(props.environment)}`} /> {browserVersion(props.environment)} {enviornmentWidth(props.environment)}
  </span>
);
