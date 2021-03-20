import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8080';
import ExampleContext from './ExampleContext';

// components
import Header from './components/Header';
import HomeGuest from './components/HomeGuest';
import Home from './components/Home';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
import CreatePost from './components/CreatePost';
import ViewSinglePost from './components/ViewSinglePost';
import FlashMessages from './components/FlashMessages';

function Main() {
  // retrieve token from local storage (if it exists) and create initial boolean value
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('complexAppToken')));
  const [flashMessages, setFlashMessages] = useState([]);

  function addFlashMessage(msg) {
    setFlashMessages(prev => prev.concat(msg));
  }

  return (
    <ExampleContext.Provider value={{ addFlashMessage, setLoggedIn }}>
      <BrowserRouter>
        <FlashMessages messages={flashMessages} />
        <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        <Switch>
          <Route path='/' exact>
            {loggedIn ? <Home /> : <HomeGuest />}
          </Route>
          <Route path='/post/:id'>
            <ViewSinglePost />
          </Route>
          <Route path='/create-post' exact>
            <CreatePost />
          </Route>
          <Route path='/about-us' exact>
            <About />
          </Route>
          <Route path='/terms' exact>
            <Terms />
          </Route>
        </Switch>
        <Footer />
      </BrowserRouter>
    </ExampleContext.Provider>
  );
}

ReactDOM.render(<Main />, document.getElementById('app'));

if (module.hot) {
  module.hot.accept();
}
