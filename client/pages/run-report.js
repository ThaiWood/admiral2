import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import moment from 'moment';
import _ from 'lodash';

import ResultTable from '../components/result-table';
import { ProjectLink, PhaseLink } from '../components/links';
import ResultCell from '../components/result-cell';
import ComponentGraph from '../components/component-graph';

import { Projects } from '../../imports/api/projects';
import { TestRun } from '../../imports/api/test-run';
import { TestResult } from '../../imports/api/test-result';
import { buildColumns } from '../utilities/environments';

import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';

const _time = (val) => {
  if (val < 1000) {
    return `${val}ms`;
  } else {
    const seconds = Math.floor((val / 100)) / 10.0;
    return `${seconds}s`
  }
}

const _isRunning = (test) => {
  for (var k in test.environments) {
    if (test.environments[k].status === 'started') {
      return true;
    }
  }
  return false;
}

const _hasResults = (test) => {
  for (var k in test.environments) {
    if (test.environments[k].status === 'fail' || test.environments[k].status === 'pass') {
      return true;
    }
  }
  return false;
}

const _failed = (test) => {
  for (var k in test.environments) {
    if (test.environments[k].status === 'fail') {
      return true;
    }
  }
  return false;
}

export class RunReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {}
    };
  }

  _steps() {
    if (!this.props.project || !this.props.project.steps) {
      return null;
    }

    let done = 0;
    let lastTime = Date.parse(this.props.run.start);
    const times = {};
    for (var i in this.props.project.steps) {
      if (this.props.project.steps[i].id == this.props.run.step) {
        done = i;
      }
      let currentTime = this.props.run.stepTimes[this.props.project.steps[i].id];
      if (currentTime) {
        times[i] = currentTime - lastTime;
        lastTime = currentTime;
      }
    }
    return (
      <table className="table">
        <tbody>
          {
            this.props.project.steps.map((step, index) => {
              return (
                <tr key={index} className="process-step">
                  <td>
                    <i className={`fa fa-${index <= done ? 'check-circle-o done' : 'circle-thin'}`} />
                      &nbsp;{step.name}&nbsp;
                  </td>
                  <td>
                    {times[index] ? <span className="time">{_time(times[index])}&nbsp;</span> : null}
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  }

  _componentGraph() {
    if (!this.props.project || !this.props.project.components) {
      return null;
    }

    const running = [];
    const active = {};
    const passed = {};
    const failed = {};

    const _add = (obj, key) => {
      if (obj[key] === undefined) {
        obj[key] = 0;
      }
      obj[key] += 1;
    }
    const _addArray = (obj, arr) => {
      for (let k of arr || []) {
        _add(obj, k);
      }
    };

    const testCount = {};
    for (let test of this.props.project.tests) {
      _addArray(testCount, test.components);
    }

    for (let test of this.props.results) {
      if (_isRunning(test)) {
        running.push(test.test);
        for (let comp of test.components || []) {
          active[comp] = true;
        }
      } else {
        if (_hasResults(test)) {
          if (_failed(test)) {
            _addArray(failed, test.components);
          } else {
            _addArray(passed, test.components);
          }
        }
      }
    }

    const comps = _.cloneDeep(this.props.project.components);
    for (let k in comps) {
      comps[k].testCount = testCount[k];
      comps[k].failed = failed[k] || 0;
      comps[k].passed = passed[k] || 0;
      comps[k].active = active[k] || false;
    }

    return (
      <div>
        <ComponentGraph components={comps} height={100} />
      </div>
    );
  }

  _findEnvironments() {
    const envs = {};
    for (let res of this.props.results) {
      for (var k in res.environments) {
        envs[k] = true;
      }
    }
    return _.keys(envs);
  }

  _renderAttributes(attributes) {
    let attrList = [];
    for (var k in attributes) {
      attrList.push({
        name: k,
        value: _.isArray(attributes[k]) ? attributes[k].join(', ') : attributes[k]
      })
    }
    attrList = _.sortBy(attrList, 'name');
    return (
      <div>
        {attrList.map((attr, index) => (
          <span key={index}>{
              index > 0 ? ", " : null
            }<strong>{attr.name}</strong>: {attr.value}</span>
        ))}
      </div>
    )
  }

  _selectFilter(fk, fv) {
    if (fv) {
      this.state.filters[fk] = fv;
    } else {
      delete this.state.filters[fk];
    }
    this.setState(this.state);
  }

  render() {
    const {columns, colWidth, sections} = buildColumns(this.props.project.environments || this._findEnvironments());

    const sortedResults = this.props.results.sort((a, b) => {
      let score_a = 0;
      for (var k in a.environments) {
        score_a += a.environments[k].status === 'fail' ? 3 : 0;
        score_a += a.environments[k].status === 'pass' ? a.environments[k].retryCount * 0.2 : 0;
      }
      let score_b = 0;
      for (var k in b.environments) {
        score_b += b.environments[k].status === 'fail' ? 3 : 0;
        score_b += b.environments[k].status === 'pass' ? b.environments[k].retryCount : 0;
      }
      if (score_a > score_b) {
        return -1;
      } else if (score_b > score_a) {
        return 1;
      } else {
        return 0;
      }
    });

    const filters = {};
    const _addFilter = (k, v) => {
      if (filters[k] === undefined) {
        filters[k] = {
          name: k,
          values: [],
          valuesByName: {},
          selected: this.state.filters[k] || null
        }
      }
      if (filters[k].valuesByName[v] === undefined) {
        filters[k].valuesByName[v] = true;
        filters[k].values.push(v);
      }
    }
    for (var sr of sortedResults) {
      if (sr.attributes) {
        for (var k in sr.attributes) {
          if (_.isArray(sr.attributes[k])) {
            for (var v of sr.attributes[k]) {
              _addFilter(k, v);
            }
          } else {
            _addFilter(k, sr.attributes[k]);
          }
        }
      }
    }
    for (var fk in filters) {
      filters[fk].values = filters[fk].values.sort();
    }

    let filter = () => true;
    if (_.keys(this.state.filters).length > 0) {
      filter = (result) => {
        var isOk = true;
        for (var k in this.state.filters) {
          if (result.attributes === undefined || result.attributes[k] === undefined) {
            isOk = false;
          }
          if (_.isArray(result.attributes[k])) {
            if (_.includes(result.attributes[k], this.state.filters[k]) === false) {
              isOk = false;
            }
          } else {
            if (result.attributes[k] !== this.state.filters[k]) {
              isOk = false;
            }
          }
        }
        return isOk;
      };
    }

    return (
      <div>
        <div className="row">
          <div className="col-md-8">
            <h1><ProjectLink project={this.props.run.project_name}/> |&nbsp;
              <PhaseLink project={this.props.run.project_name} phase={this.props.run.phase_name} /> |&nbsp;
              {this.props.run.name}</h1>
            {this.props.run ? <div>Started {moment(this.props.run.start).format('M/D/YY - h:mm a')}</div> : null}
            {this.props.project && sortedResults.length > 0 ? this._componentGraph() : null}
          </div>
          <div className="col-md-4">
            <div className="well">
              {this._steps()}
            </div>
          </div>
        </div>
        <div className="pull-right">
          {_.keys(filters).map((fk, index) => (
            <span key={`filter-${index}`} style={{display: 'inline-block', paddingRight: '1em'}}>
              <strong>{fk}</strong><br/>
              <ButtonGroup>
                <Button
                  bsSize="xsmall"
                  onClick={() => this._selectFilter(fk, null)}
                  bsStyle={filters[fk].selected === null ? "success" : "default"}>Any</Button>
                {filters[fk].values.map((fv) => (
                  <Button
                    bsSize="xsmall"
                    onClick={() => this._selectFilter(fk, fv)}
                    bsStyle={filters[fk].selected === fv ? "success" : "default"} key={`filter-${index}-${fv}`}>{fv}</Button>
                ))}
              </ButtonGroup>
            </span>
          ))}
        </div>
        <table width="100%" className="results-table table table-striped">
          <thead>
            <tr>
              <th width="40%" />
              {sections.map((sect, index) => (
                <th key={`section-${index}`} colSpan={sect.cols} style={{textAlign: 'center'}} className="browser">
                  <i className={`fa ${sect.icon}`} />
                </th>
              ))}
            </tr>
            <tr>
              <th>
                Test name
              </th>
              {columns.map((col, index) => (
                <th width={`${colWidth}%`} style={{textAlign: 'center'}} key={`title-${index}`}>
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <ReactCSSTransitionGroup component="tbody" transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            {_.filter(sortedResults, filter).map((result, index) => (
              <tr key={`${result.test}-${index}`}>
                <td>
                  <a href={`/run/${this.props.run._id}/${result._id}`}>{result.test}</a><br/>
                  {this._renderAttributes(result.attributes)}
                </td>
                {columns.map((col, cindex) => (
                  <ResultCell environment={col.key} resultId={result._id} result={result.environments[col.key]} key={`${index}-${cindex}`} />
                ))}
              </tr>
            ))}
          </ReactCSSTransitionGroup>
        </table>
      </div>
    );
  }
}

export const RunReportContainer = createContainer(({ run }) => {
  const runObj = TestRun.findOne({_id: run});
  let project = {steps: []};
  if (runObj) {
    project = Projects.findOne(runObj.project);
  }
  return {
    project,
    run: TestRun.findOne({_id: run}) || {_id: ""},
    results: TestResult.find({run: run}).fetch() || []
  };
}, RunReport);
