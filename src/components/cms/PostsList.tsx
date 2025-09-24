import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { postsApi, Post } from '../../services/cmsApi';
import TenantGuard from '../common/TenantGuard';
import ApiDebugger from '../common/ApiDebugger';
import AuthTest from '../common/AuthTest';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface PostsListProps {
  type?: 'post' | 'page';
}

const PostsList: React.FC<PostsListProps> = ({ type = 'post' }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', page, search, status, type, user?.current_tenant_id],
    queryFn: () => postsApi.getAll({
      pageNumber: page,
      pageSize: 10,
      type,
      status: status === 'all' ? undefined : status,
      search: search || undefined,
    }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(`${type === 'post' ? 'Post' : 'Page'} deleted successfully`);
    },
    onError: () => {
      toast.error('Failed to delete');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      postsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const posts = data?.data || [];
  const totalPages = data?.totalPages || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg">
        Failed to load {type}s. Please try again.
      </div>
    );
  }

  return (
    <TenantGuard>
      <div className="space-y-6">
        {/* Debug Components */}
        <AuthTest />
        <ApiDebugger />

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-title-md font-semibold text-gray-900 dark:text-white">
              {type === 'post' ? 'Posts' : 'Pages'}
            </h1>
            <p className="text-theme-sm text-gray-600 dark:text-gray-400">
              Manage your {type}s and content
            </p>
          </div>
          <Link
            to={`/cms/${type}s/new`}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create {type === 'post' ? 'Post' : 'Page'}
          </Link>
        </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${type}s...`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post: Post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.featuredImageUrl && (
                        <img
                          src={post.featuredImageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {post.excerpt}
                        </div>
                        <div className="text-xs text-gray-400">
                          by {post.authorName} • {post.destinationName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusChange(post.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                        post.status === 'published'
                          ? 'bg-success-100 text-success-800'
                          : post.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.publishAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <Link
                      to={`/cms/${type}s/edit/${post.id}`}
                      className="text-brand-600 hover:text-brand-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="text-error-600 hover:text-error-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {data?.pageNumber || 1} of {totalPages} ({data?.totalCount || 0} total items)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!data?.hasPreviousPage}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data?.hasNextPage}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </TenantGuard>
  );
};

export default PostsList;
