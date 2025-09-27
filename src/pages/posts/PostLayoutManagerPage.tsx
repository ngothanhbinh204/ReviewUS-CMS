// PostLayoutManagerPage.tsx - Wrapper component for routing
import React from 'react';
import PostLayoutManager from '../../components/posts/PostLayoutManager';

const PostLayoutManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PostLayoutManager />
    </div>
  );
};

export default PostLayoutManagerPage;