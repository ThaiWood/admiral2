import React from 'react';
import CheckMark from './check-mark';

const ResultCell = (props) => (
  props.result ? (
    <td className={`result ${props.result.status}`} style={{textAlign: "center"}}>
      <a href={`/result/${props.resultId}/${props.environment}`}>
        {props.result.status === 'pending' ? <i className="glyphicon glyphicon-minus"></i> : null}
        {props.result.status === 'started' ? <img src="/spin.gif" style={{width: 25, height: 25}}></img> : null}
        {props.result.status === 'pass' ? <CheckMark retryCount={props.result.retryCount ? props.result.retryCount : 0} /> : null}
        {props.result.status === 'fail' ? <i className="glyphicon glyphicon-remove"></i> : null}
        {props.result.status === 'retry' ? <i className="glyphicon glyphicon-refresh"></i> : null}
      </a>
    </td>
  ) : (
    <td>
    </td>
  )
);

export default ResultCell;
