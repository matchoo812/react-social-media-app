import React, { useState, useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8080';

import StateContext from './StateContext';
import DispatchContext from './DispatchContext';

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
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import Search from './components/Search';
import Chat from './components/Chat';

function Main() {
  // retrieve token from local storage (if it exists) and create initial boolean value
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexAppToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexAppToken'),
      username: localStorage.getItem('complexAppUsername'),
      avatar: localStorage.getItem('complexAppAvatar'),
      searchIsOpen: false,
      chatIsOpen: false,
      unreadChatCount: 0,
    },
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case 'logout':
        draft.loggedIn = false;
        break;
      case 'flashmessage':
        draft.flashMessages.push(action.value);
        break;
      case 'openSearch':
        draft.searchIsOpen = true;
        break;
      case 'closeSearch':
        draft.searchIsOpen = false;
        break;
      case 'toggleChat':
        draft.chatIsOpen = !draft.chatIsOpen;
        break;
      case 'closeChat':
        draft.chatIsOpen = false;
        break;
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++;
        break;
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0;
        break;
      default:
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexAppToken', state.user.token);
      localStorage.setItem('complexAppUsername', state.user.username);
      localStorage.setItem('complexAppAvatar', state.user.avatar);
    } else {
      localStorage.removeItem('complexAppToken');
      localStorage.removeItem('complexAppUsername');
      localStorage.removeItem('complexAppAvatar');
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path='/' exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>
            <Route path='/profile/:username'>
              <Profile />
            </Route>
            <Route path='/post/:id' exact>
              <ViewSinglePost />
            </Route>
            <Route path='/post/:id/edit' exact>
              <EditPost />
            </Route>
            <Route path='/create-post'>
              <CreatePost />
            </Route>
            <Route path='/about-us'>
              <About />
            </Route>
            <Route path='/terms'>
              <Terms />
            </Route>
            {/* fallback route at end */}
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <CSSTransition
            timeout={330}
            in={state.searchIsOpen}
            classNames='search-overlay'
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.getElementById('app'));

if (module.hot) {
  module.hot.accept();
}
