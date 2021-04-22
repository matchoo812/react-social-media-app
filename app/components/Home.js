import React, { useEffect, useContext, Fragment } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useImmer } from 'use-immer';
import StateContext from '../StateContext';

import Page from './Page';
import LoadingIcon from './LoadingIcon';

function Home() {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  });

  useEffect(() => {
    const ourRequest = axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await axios.post(
          '/getHomeFeed',
          { token: appState.user.token },
          { cancelToken: ourRequest.token }
        );
        setState(draft => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingIcon />;
  }

  return (
    <Page title='Your Feed'>
      {state.feed.length > 0 && (
        <Fragment>
          <h2 className='text-center mb-4'>The Latest from Accounts You Follow</h2>
          <div className='list-group'>
            {state.feed.map(post => {
              const date = new Date(post.createdDate);
              const formattedDate = `${
                date.getMonth() + 1
              }/${date.getDate()}/${date.getFullYear()}`;
              return (
                <Link
                  onClick={() => appDispatch({ type: 'closeSearch' })}
                  to={`/post/${post._id}`}
                  key={post._id}
                  className='list-group-item list-group-item-action'
                >
                  <img className='avatar-tiny' src={post.author.avatar} />{' '}
                  <strong>{post.title}</strong>{' '}
                  <span className='text-muted small'>
                    {' '}
                    by {post.author.username} on {formattedDate}{' '}
                  </span>
                </Link>
              );
            })}
          </div>
        </Fragment>
      )}
      {state.feed.length == 0 && (
        <Fragment>
          <h2 className='text-center'>
            Hello, <strong>{appState.user.username}.</strong> Your feed is empty.
          </h2>
          <p className='lead text-muted text-center'>
            Your feed displays the latest posts from people you follow. If you don't have any
            friends to follow, that's ok; you can use the "Search" feature in the top menu bar to
            find content written by people with similar interests and then follow them.
          </p>
        </Fragment>
      )}
    </Page>
  );
}

export default Home;
