import React from 'react';
import _ from 'lodash';
import ProgressBar from '../components/progress-bar';

class GroupedReport extends React.Component {
  render() {
    let rows = [];
    for (let env in this.props.data || {}) {
      let envResult = this.props.data[env];
      if (envResult.total > 0) {
        rows.push({
          environment: env,
          passed: Math.floor((parseFloat(envResult.passed) / parseFloat(envResult.total)) * 100.00),
          retryPercent: Math.floor((parseFloat(envResult.retries) / parseFloat(envResult.total)) * 100.0)
        });
      }
    }
    rows = _.sortBy(rows, 'environment');
    return rows ? (
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Pass %</th>
            <th>Retry %</th>
          </tr>
        </thead>
        <tbody style={{background: 'white'}}>
          {rows.map((row, index) => (
            <tr key={`env-${row.environment}`}>
              <td>
                {row.environment}
              </td>
              <td>
                <ProgressBar percent={row.passed} />
              </td>
              <td>
                <ProgressBar percent={row.retryPercent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : null;
  }
}

export default GroupedReport;
