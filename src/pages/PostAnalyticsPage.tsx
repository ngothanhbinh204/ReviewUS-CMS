import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PostAnalytics from '../components/posts/PostAnalytics';
import { postService } from '../services/postService';
import { PostListDto } from '../types/post.types';

const PostAnalyticsPage: React.FC = () => {
  const [posts, setPosts] = useState<PostListDto[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts({
        pageNumber: 1,
        pageSize: 50,
        status: 'published'
      });
      
      const posts = response.data || [];
      setPosts(posts);
      if (posts.length > 0) {
        setSelectedPostId(posts[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchPosts}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">Dashboard</Link>
            <span>/</span>
            <span>Post Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post Analytics & Performance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your posts' performance, SEO metrics, and engagement
          </p>
        </div>
        <Link
          to="/posts"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          All Posts
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No published posts found
          </div>
          <Link
            to="/posts/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Post Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Select Post
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPostId === post.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    {post.viewCount !== undefined && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {post.viewCount.toLocaleString()} views
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Content */}
          <div className="lg:col-span-3">
            {selectedPostId ? (
              <PostAnalytics postId={selectedPostId} />
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a post to view its analytics
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAnalyticsPage;
