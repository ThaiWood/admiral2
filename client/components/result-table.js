import React from 'react';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import ResultCell from './result-cell';

import { buildColumns } from '../utilities/environments';

import _ from 'lodash';

const _findEnvironments = (results) => {
  const envs = {};
  for (let r of results) {
    for (var k in r.environments) {
      envs[k] = true;
    }
  }
  return _.keys(envs);
};

const ResultTable = (props) => {
  const {columns, colWidth, sections} = buildColumns(
    props.project.environments || _findEnvironments(props.results)
  );
  const headerElements = props.headerElements.map((elem, index) => React.cloneElement(elem, {key: `header-${index}`}));

  return (
    <table width="100%" className="results-table table table-striped">
      <thead>
        <tr>
          {headerElements.map((elem, index) => (
            <th key={`spacer-${index}`} />
          ))}
          {sections.map((sect, index) => (
            <th key={`section-${index}`} colSpan={sect.cols} style={{textAlign: 'center'}} className="browser">
              <i className={`fa ${sect.icon}`} />
            </th>
          ))}
        </tr>
        <tr>
          {headerElements}
          {columns.map((col, index) => (
            <th width={`${colWidth}%`} style={{textAlign: 'center'}} key={`title-${index}`}>
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <ReactCSSTransitionGroup component="tbody" transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {props.results.map((result, index) => (
          <tr key={props.indexGenerator(result)}>
            {props.rowElements(result).map((elem, sindex) => React.cloneElement(elem, {key: `extra-columns-${sindex}-${index}`}))}
            {columns.map((col, cindex) => (
              result.environments[col.key] ?
                <ResultCell environment={col.key} resultId={result._id} result={result.environments[col.key]} key={`${index}-${cindex}`} />
                : null
            ))}
          </tr>
        ))}
      </ReactCSSTransitionGroup>
    </table>
  );
}

ResultTable.defaultProps = {
  browserColumnWidth: 15,
  indexGenerator: (result) => result.test
};

export default ResultTable;
