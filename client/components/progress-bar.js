import React from 'react';

export default (props) => (
  <div className="progress">
    <div className="progress-bar" role="progressbar" aria-valuenow={props.percent} aria-valuemin="0" aria-valuemax="100" style={{
        width: `${props.percent}%`
      }}>
      {props.percent}%
    </div>
  </div>
);
