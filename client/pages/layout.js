import React from 'react';

const Layout = (props) => (
  <div className="body">
    <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="/">
            <img src="/armada.png" height={30} style={{display: "inline"}} />&nbsp;
            Admiral 2
          </a>
        </div>
        <div id="navbar" className="navbar-collapse collapse">
          <ul className="nav navbar-nav">
            <li className="active"><a href="/">Projects</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <div className="container-fluid content" role="main">
      {props.children}
    </div>
  </div>
);

export default Layout;
