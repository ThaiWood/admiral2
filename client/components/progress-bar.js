import React from 'react';

const _capped = (pct) => pct < 0 ? 0 : pct > 100 ? 100 : pct;

export default (props) => (
  <div className="progress">
    <div className="progress-bar" role="progressbar" aria-valuenow={_capped(props.percent)} aria-valuemin="0" aria-valuemax="100" style={{
        width: `${_capped(props.percent)}%`
      }}>
      {_capped(props.percent)}%
    </div>
  </div>
);
