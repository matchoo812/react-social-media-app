import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingIcon from './LoadingIcon';

function ProfileFollowing(props) {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ourRequest = axios.CancelToken.source();

    async function fetchPosts() {
      try {
        const response = await axios.get(`/profile/${username}/following`, {
          cancelToken: ourRequest.token,
        });
        // console.log(response.data);
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    fetchPosts();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  if (isLoading)
    return (
      <div>
        <LoadingIcon />
      </div>
    );

  return (
    <div className='list-group'>
      {posts.map((follower, index) => {
        return (
          <Link
            to={`/profile/${follower.username}`}
            key={index}
            className='list-group-item list-group-item-action'
          >
            <img className='avatar-tiny' src={follower.avatar} /> {follower.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollowing;
