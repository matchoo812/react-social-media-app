import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, withRouter } from 'react-router-dom';
import axios from 'axios';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import Page from './Page';
import LoadingIcon from './LoadingIcon';
import ReactMarkdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';
import NotFound from './NotFound';

function ViewSinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();

  useEffect(() => {
    // create cancel token to pass along in get request in case the use navigates away
    const ourRequest = axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        // console.log(response.data);
        setPost(response.data);
        setIsLoading(false);
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

  if (!isLoading && !post) {
    return <NotFound />;
  }

  if (isLoading)
    return (
      <Page title='...'>
        <LoadingIcon />
      </Page>
    );

  const date = new Date(post.createdDate);
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  }

  async function handleDelete() {
    const isSure = window.confirm('Do you really want to delete this post?');
    if (isSure) {
      try {
        const response = await axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        });
        if (response.data == 'Success') {
          // display flash message
          appDispatch({ type: 'flashMessage', value: 'Post was successfully deleted.' });
          // redirect to user's profile
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className='pt-2'>
            <Link
              to={`/post/${post._id}/edit`}
              data-tip='Edit'
              data-for='edit'
              className='text-primary mr-2'
            >
              <i className='fas fa-edit'></i>
            </Link>
            <ReactTooltip id='edit' className='custom-tooltip' />{' '}
            <a
              onClick={handleDelete}
              className='delete-post-button text-danger'
              data-tip='Delete'
              data-for='delete'
            >
              <i className='fas fa-trash'></i>
            </a>
            <ReactTooltip id='delete' className='custom-tooltip' />{' '}
          </span>
        )}
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}`}>
          <img className='avatar-tiny' src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on{' '}
        {formattedDate}
      </p>

      <div className='body-content'>
        <ReactMarkdown
          children={post.body}
          allowedTypes={['paragraph', 'strong', 'emphasis', 'text', 'heading', 'list', 'listItem']}
        />
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
