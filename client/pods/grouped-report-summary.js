import React from 'react';
import _ from 'lodash';

export default class GroupedReportSummary extends React.Component {
  render() {
    const keys = _.filter(_.keys(this.props.data || {}), (k) => this.props.data[k].total > 0);

    return (
      <div>
        {keys.map((k, index) => (
          <span key={`summary-${index}`}>
            <strong>{k}</strong>: {Math.floor((this.props.data[k].passed / this.props.data[k].total) * 100.0)}%&nbsp;
          </span>
        ))}
      </div>
    )
  }
}
