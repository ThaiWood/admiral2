import React from 'react';
import moment from 'moment';
import { VictoryGroup, VictoryLine, VictoryScatter, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

const palette = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'];

export default class StepTimingsByDate extends React.Component {
  render() {
    const rowsByKey = {};
    for (let run of this.props.data) {
      for (let k in run.timings) {
        if (k !== 'start' && k !== 'end') {
          if (rowsByKey[k] === undefined) {
            rowsByKey[k] = {
              key: k,
              data: []
            };
          }
          rowsByKey[k].data.push({
            x: run.date,
            y: run.timings[k] / 1000.0
          });
        }
      }
    }
    const rows = _.values(rowsByKey);
    const components = [];
    let index = 0;
    for (let row of rows) {
      components.push((
        <VictoryLine
          data={row.data}
          interpolation="basis"
          style={{
            data: {
              stroke: palette[index],
              strokeWidth: 2
            },
          }}
          />
      ));
      components.push((
        <VictoryScatter
          data={row.data}
          style={{
            data: {
              fill: palette[index],
              stroke: "white",
              strokeWidth: 1
            },
          }}
          />
      ));
      index++;
    }

    return (
      <div>
        <VictoryChart>
          <VictoryAxis
            scale="time"
            tickFormat={(x) => moment(x).format('M/D')} />
          <VictoryAxis
            label="Time (s)"
            dependentAxis
            />
          {components}
        </VictoryChart>
        {rows.map((row, index) => (
          <div className="container-fluid" key={`key-${index}`}>
            <div className="row">
              <div className="col-sm-4" style={{margin: 5}}>
                <div style={{
                    height: 20,
                    width: 20,
                    backgroundColor: palette[index],
                    display: "inline-block"
                  }}>&nbsp;</div>&nbsp;
                {row.key}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
