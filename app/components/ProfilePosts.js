import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function ProfilePosts() {
  const { username } = useParams();
  const { isLoading, setIsLoading } = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get(`/profile/${username}/posts`);
        // console.log(response.data);
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    fetchPosts();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='list-group'>
      {posts.map(post => {
        const date = new Date(post.createdDate);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return (
          <Link
            to={`/post/${post._id}`}
            key={post._id}
            className='list-group-item list-group-item-action'
          >
            <img className='avatar-tiny' src={post.author.avatar} /> <strong>{post.title}</strong>{' '}
            <span className='text-muted small'> on {formattedDate} </span>
          </Link>
        );
      })}
    </div>
  );
}

export default ProfilePosts;