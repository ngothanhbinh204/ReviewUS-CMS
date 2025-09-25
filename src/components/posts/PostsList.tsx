import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { postService } from '../../services/postService';
import { PostListDto, PostQueryParams } from '../../types/post.types';

const PostsList: React.FC = () => {
  const [posts, setPosts] = useState<PostListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const [filters, setFilters] = useState<PostQueryParams>({
    pageNumber: 1,
    pageSize: 10,
    status: '',
    search: ''
  });

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts(filters);
      
      // Backend trả về data as array trong PagedApiResponse
      setPosts(response.data || []);
      
      // Lấy pagination info trực tiếp từ response
      setPagination({
        pageNumber: response.pageNumber || 1,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
        pageSize: response.pageSize || 10,
        hasPreviousPage: response.hasPreviousPage || false,
        hasNextPage: response.hasNextPage || false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      // Reset data on error
      setPosts([]);
      setPagination({
        pageNumber: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
        hasPreviousPage: false,
        hasNextPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, pageNumber: 1 }));
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };

  const handlePublishToggle = async (post: PostListDto) => {
    try {
      if (post.status === 'published') {
        await postService.unpublishPost(post.id);
      } else {
        await postService.publishPost(post.id);
      }
      fetchPosts(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update post status');
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        fetchPosts(); // Refresh the list
      } catch (err: any) {
        setError(err.message || 'Failed to delete post');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your blog posts and content</p>
        </div>
        <Link
          to="/posts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Create Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-2 rounded-md ${!filters.status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('draft')}
              className={`px-3 py-2 rounded-md ${filters.status === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Draft
            </button>
            <button
              onClick={() => handleStatusFilter('published')}
              className={`px-3 py-2 rounded-md ${filters.status === 'published' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.featuredImage && (
                        <img 
                          src={post.featuredImage.url} 
                          alt={post.featuredImage.alt}
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <Link 
                          to={`/posts/${post.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {post.title}
                        </Link>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.author?.displayName || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {post.viewCount?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/posts/${post.id}/revisions`}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Revisions
                      </Link>
                      <button
                        onClick={() => handlePublishToggle(post)}
                        className={`${
                          post.status === 'published' 
                            ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400' 
                            : 'text-green-600 hover:text-green-700 dark:text-green-400'
                        }`}
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages && pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.pageNumber || 1) - 1) * (pagination.pageSize || 10) + 1} to{' '}
                {Math.min((pagination.pageNumber || 1) * (pagination.pageSize || 10), pagination.totalCount || 0)} of{' '}
                {pagination.totalCount || 0} results
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange((pagination.pageNumber || 1) - 1)}
                  disabled={(pagination.pageNumber || 1) === 1}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      page === (pagination.pageNumber || 1)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange((pagination.pageNumber || 1) + 1)}
                  disabled={(pagination.pageNumber || 1) === (pagination.totalPages || 1)}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;
