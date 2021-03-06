import React, { useEffect, useContext } from 'react';
import { Link, useParams, withRouter } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import axios from 'axios';
import Page from './Page';
import LoadingIcon from './LoadingIcon';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import NotFound from './NotFound';

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case 'titleChange':
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        return;
      case 'bodyChange':
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        return;
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = 'You must provide a title.';
        }
        return;
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = 'You must provide body text.';
        }
        return;
      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      case 'saveRequestStarted':
        draft.isSaving = true;
        return;
      case 'saveRequestFinished':
        draft.isSaving = false;
        return;
      case 'notFound':
        draft.notFound = true;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: 'titleRules', value: state.title.value });
    dispatch({ type: 'bodyRules', value: state.body.value });
    dispatch({ type: 'submitRequest' });
  }

  useEffect(() => {
    // create cancel token to pass along in get request in case the use navigates away
    const ourRequest = axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        // console.log(response.data);
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data });
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: 'flashMessage',
              value: 'You do not have permission to edit this post.',
            });
            // redirect to home page
            props.history.push('/');
          }
        } else {
          dispatch({ type: 'notFound' });
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchPost();
    // cleanup function when component is unmounted
    return () => {
      ourRequest.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' });
      const ourRequest = axios.CancelToken.source();

      async function fetchPost() {
        try {
          const response = await axios.post(
            `/post/${state.id}/edit`,
            { title: state.title.value, body: state.body.value, token: appState.user.token },
            { cancelToken: ourRequest.token }
          );
          // console.log(response.data);
          dispatch({ type: 'saveRequestFinished' });
          appDispatch({ type: 'flashMessage', value: 'Post updated successfully!' });
        } catch (error) {
          console.log(error);
        }
      }
      fetchPost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }

  if (state.isFetching)
    return (
      <Page title='...'>
        <LoadingIcon />
      </Page>
    );

  return (
    <Page title='Edit Post'>
      <Link to={`/post/${state.id}`} className='small font-weight-bold'>
        &laquo; Back to Post
      </Link>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            onBlur={e => dispatch({ type: 'titleRules', value: e.target.value })}
            onChange={e => dispatch({ type: 'titleChange', value: e.target.value })}
            defaultValue={state.title.value}
            autoFocus
            type='text'
            className='form-control form-control-lg form-control-title'
            id='post-title'
            autoComplete='off'
            placeholder=''
          />
          {state.title.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.title.message}
            </div>
          )}
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            onBlur={e => dispatch({ type: 'bodyRules', value: e.target.value })}
            onChange={e => dispatch({ type: 'bodyChange', value: e.target.value })}
            defaultValue={state.body.value}
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
          />
          {state.body.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>{state.body.message}</div>
          )}
        </div>

        <button className='btn btn-primary' disabled={state.isSaving}>
          {state.isSaving ? 'Saving...' : 'Update Post'}
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
