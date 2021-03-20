import React from 'react';
import Page from './Page';

function Home() {
  return (
    <Page title='Your Feed'>
      <h2 className='text-center'>
        Hello, <strong>{localStorage.getItem('complexAppUsername')}.</strong> Your feed is empty.
      </h2>
      <p className='lead text-muted text-center'>
        Your feed displays the latest posts from people you follow. If you don't have any friends to
        follow, that's ok; you can use the "Search" feature in the top menu bar to find content
        written by people with similar interests and then follow them.
      </p>
    </Page>
  );
}

export default Home;
