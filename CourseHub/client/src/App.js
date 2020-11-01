import React from 'react';

import { BrowserRouter as Router, Redirect, withRouter } from "react-router-dom";
import './App.scss';
import Main from './Components/MainComponent';

function App() {


  return (
    <Router>
      <Main />
    </Router>
  );
}

export default App;
