import React from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import Exercise from './Exercise';
import Lesson from './Lesson';

const App = () => (
  <Router>
    <Switch>
      <Route path="/exercise" component={Exercise} />
      <Route path="/" component={Lesson} />
    </Switch>
  </Router>
);

export default App;
