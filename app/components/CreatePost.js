import React, { useState, useContext } from 'react';
import Page from './Page';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import ExampleContext from '../ExampleContext';

function CreatePost(props) {
  const [title, setTitle] = useState();
  const [body, setBody] = useState();
  const { addFlashMessage } = useContext(ExampleContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post('/create-post', {
        title,
        body,
        token: localStorage.getItem('complexAppToken'),
      });
      // redirect to new post url
      addFlashMessage('New post created successfully!');
      props.history.push(`post/${response.data}`);
      console.log('New post created!');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Page title='Create New Post'>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            onChange={e => setTitle(e.target.value)}
            autoFocus
            type='text'
            className='form-control form-control-lg form-control-title'
            id='post-title'
            autoComplete='off'
            placeholder=''
          />
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            onChange={e => setBody(e.target.value)}
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
          ></textarea>
        </div>

        <button className='btn btn-primary'>Save New Post</button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
