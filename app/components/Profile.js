import React, { useEffect, useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Page from './Page';
import StateContext from '../StateContext';
import ProfilePosts from './ProfilePosts';

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  // provide initial state for user data while axios fetches real data
  const [profileData, setProfileData] = useState({
    profileUsername: '...',
    profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
    isFollowing: false,
    counts: { postCount: '', followerCount: '', followingCount: '' },
  });

  const ourRequest = axios.CancelToken.source();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post(
          `/profile/${username}`,
          { token: appState.user.token },
          { cancelToken: ourRequest.token }
        );
        // console.log(response.data);
        setProfileData(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  return (
    <Page title='Profile Screen'>
      <h2>
        <img src={profileData.profileAvatar} alt='' className='avatar-small' />
        {profileData.profileUsername}
        <button className='btn btn-primary btn-sm ml-2'>
          Follow <i className='fas fa-user-plus'></i>
        </button>
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <Link to='#' className='active nav-item nav-link'>
          Posts: {profileData.counts.postCount}
        </Link>
        <Link to='#' className='nav-item nav-link'>
          Followers: {profileData.counts.followerCount}
        </Link>
        <Link to='#' className='nav-item nav-link'>
          Following: {profileData.counts.followingCount}
        </Link>
      </div>

      <ProfilePosts />
    </Page>
  );
}

export default Profile;
