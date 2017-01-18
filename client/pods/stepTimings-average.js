import React from 'react';
import { VictoryPie, VictoryTheme } from 'victory';

export default class StepTimingsAverage extends React.Component {
  render() {
    const outside = [];
    let outsideTotal = 0;
    for (let k in this.props.data) {
      if (k !== 'start' && k !== 'end' && k !== 'test-run') {
        outside.push({
          x: k,
          y: this.props.data[k]
        });
        outsideTotal += this.props.data[k];
      }
    }
    const comparison = [
      {
        x: "outside",
        y: outsideTotal
      },
      {
        x: "testing",
        y: this.props.data["test-run"]
      }
    ];
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-6">
              <h3>Outside Of Testing</h3>
              <VictoryPie data={outside} padding={60} theme={VictoryTheme.material} />
            </div>
            <div className="col-xl-6">
              <h3>Comparing To Tests</h3>
              <VictoryPie
                data={comparison} padding={60} theme={VictoryTheme.material} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
