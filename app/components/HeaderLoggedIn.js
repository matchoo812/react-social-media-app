import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ExampleContext from '../ExampleContext';

function HeaderLoggedIn(props) {
  const { setLoggedIn } = useContext(ExampleContext);

  function handleLogout() {
    setLoggedIn(false);
    localStorage.removeItem('complexAppToken');
    localStorage.removeItem('complexAppUsername');
    localStorage.removeItem('complexAppAvatar');
  }

  return (
    <div className='flex-row my-3 my-md-0'>
      <Link to='#' className='text-white mr-2 header-search-icon'>
        <i className='fas fa-search'></i>
      </Link>
      <span className='mr-2 header-chat-icon text-white'>
        <i className='fas fa-comment'></i>
        <span className='chat-count-badge text-white'></span>
      </span>
      <Link to='#' className='mr-2'>
        <img
          src={localStorage.getItem('complexAppAvatar')}
          alt=''
          className='small-header-avatar'
        />
      </Link>
      <Link to='/create-post' className='btn btn-sm btn-success mr-2'>
        Create Post
      </Link>
      <button onClick={handleLogout} className='btn btn-sm btn-secondary'>
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
