import React, { useEffect, Suspense } from 'react';
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
const CreatePost = React.lazy(() => import('./components/CreatePost'));
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'));
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import Search from './components/Search';
const Chat = React.lazy(() => import('./components/Chat'));
import LoadingIcon from './components/LoadingIcon';

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
      case 'flashMessage':
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

  // check if token has expired on render
  useEffect(() => {
    if (state.loggedIn) {
      // send axios request if component has already been rendered
      const ourRequest = axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await axios.post(
            '/checkToken',
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          );
          if (!response.data) {
            dispatch({ type: 'logout' });
            dispatch({
              type: 'flashMessage',
              value: 'Your session has expired. Please log in again.',
            });
          }
          console.log(response.data);
        } catch (error) {
          console.log(error);
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingIcon />}>
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
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.searchIsOpen}
            classNames='search-overlay'
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Suspense fallback=''>{state.loggedIn && <Chat />}</Suspense>
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
