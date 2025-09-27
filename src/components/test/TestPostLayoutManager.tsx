import React from 'react';
import PostLayoutManager from '../posts/PostLayoutManager';

const TestPostLayoutManager: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PostLayoutManager />
    </div>
  );
};

export default TestPostLayoutManager;