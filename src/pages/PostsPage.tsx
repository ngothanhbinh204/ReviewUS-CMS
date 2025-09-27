import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import PostsList from '../components/posts/PostsList';
import PostForm from '../components/posts/PostForm';
import PostRevisions from '../components/posts/PostRevisions';
import RevisionCompare from '../components/posts/RevisionCompare';
import PostLayoutManagerPage from './posts/PostLayoutManagerPage';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const PostsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Posts List */}
          <Route path="/" element={<PostsList />} />
          
 
          {/* Create New Post */}
          <Route path="/new" element={<PostForm />} />
          
          {/* Edit Existing Post */}
          <Route path="/:id/edit" element={<PostForm />} />
          
          {/* Post Revisions */}
          <Route path="/:id/revisions" element={<PostRevisions />} />
          
          {/* Compare Revisions */}
          <Route path="/:id/revisions/compare" element={<RevisionCompare />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/posts" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default PostsPage;
