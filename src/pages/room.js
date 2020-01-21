import React, { useEffect } from 'react';
import Layout from '../components/layout';
import { Router } from '@reach/router';
import VideoDisplay from '../components/VideoDisplay';
import { navigate } from 'gatsby';

const BounceToHome = () => {
  useEffect(() => {
    navigate('/', { replace: true });
  }, []);
  return null;
};

export default () => {
  return (
    <Layout>
      <Router>
        <VideoDisplay path="room/:roomID" />
        <BounceToHome default />
      </Router>
    </Layout>
  );
};
