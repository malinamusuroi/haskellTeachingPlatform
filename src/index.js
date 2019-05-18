import React from 'react';
import ReactDOM from 'react-dom';
import {
  Switch, Route, Link, BrowserRouter as Router,
} from 'react-router-dom';
import App from './App';
import Exercise from './Exercise';
import Lesson from './Lesson';

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/exercise" component={Exercise} />
      <Route path="/" component={Lesson} />
    </Switch>
  </Router>,
  document.getElementById('root'),
);
