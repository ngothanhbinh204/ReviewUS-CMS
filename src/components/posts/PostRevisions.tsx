import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { postService } from '../../services/postService';
import { PostRevisionListDto, RevisionQueryParams, PostDto } from '../../types/post.types';

const PostRevisions: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<PostDto | null>(null);
  const [revisions, setRevisions] = useState<PostRevisionListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRevisions, setSelectedRevisions] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const [filters, setFilters] = useState<RevisionQueryParams>({
    pageNumber: 1,
    pageSize: 20
  });

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchRevisions();
    }
  }, [id, filters]);

  const fetchPost = async () => {
    if (!id) return;
    try {
      const response = await postService.getPost(id);
      setPost(response.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch post');
    }
  };

  const fetchRevisions = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await postService.getRevisions(id, filters);
      setRevisions(response.data || []);
      
      // Update pagination from response  
      setPagination({
        pageNumber: response.pageNumber || 1,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
        pageSize: response.pageSize || 20,
        hasPreviousPage: response.hasPreviousPage || false,
        hasNextPage: response.hasNextPage || false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch revisions');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };

  const handleRevert = async (revisionId: number) => {
    if (!id) return;
    
    const confirmed = window.confirm('Are you sure you want to revert to this revision? This will create a new revision with the selected content.');
    if (!confirmed) return;

    try {
      await postService.revertToRevision(id, revisionId, {
        revisionNotes: 'Reverted to previous revision'
      });
      fetchRevisions(); // Refresh the list
      fetchPost(); // Refresh post data
    } catch (err: any) {
      setError(err.message || 'Failed to revert to revision');
    }
  };

  const handleCompareRevisions = () => {
    if (selectedRevisions.length !== 2) {
      alert('Please select exactly 2 revisions to compare');
      return;
    }
    
    const [from, to] = selectedRevisions.sort((a, b) => a - b);
    window.open(`/posts/${id}/revisions/compare?from=${from}&to=${to}`, '_blank');
  };

  const handleRevisionSelect = (revisionId: number) => {
    setSelectedRevisions(prev => {
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId);
      } else if (prev.length < 2) {
        return [...prev, revisionId];
      } else {
        return [prev[1], revisionId];
      }
    });
  };

  const handleDeleteRevision = async (revisionId: number) => {
    if (!id) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this revision? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await postService.deleteRevision(id, revisionId);
      fetchRevisions(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete revision');
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return '🆕';
      case 'update':
        return '✏️';
      case 'revert':
        return '↩️';
      case 'manual':
        return '📝';
      default:
        return '📄';
    }
  };

  const getChangeTypeBadge = (changeType: string) => {
    const styles = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      revert: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[changeType as keyof typeof styles] || styles.update}`}>
        {getChangeTypeIcon(changeType)} {changeType.charAt(0).toUpperCase() + changeType.slice(1)}
      </span>
    );
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const revisionDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - revisionDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
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
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/posts" className="hover:text-gray-700 dark:hover:text-gray-300">Posts</Link>
            <span>/</span>
            <Link to={`/posts/${id}`} className="hover:text-gray-700 dark:hover:text-gray-300">
              {post?.title || 'Post'}
            </Link>
            <span>/</span>
            <span>Revisions</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post Revisions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track changes and manage different versions of your post
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCompareRevisions}
            disabled={selectedRevisions.length !== 2}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare Selected ({selectedRevisions.length}/2)
          </button>
          <Link
            to={`/posts/${id}/edit`}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Edit Post
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Current Post Info */}
      {post && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Current Version</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {post.title} - Status: {post.status} - Last updated: {formatRelativeTime(post.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {post.viewCount && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  👀 {post.viewCount.toLocaleString()} views
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revisions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRevisions(revisions.slice(0, 2).map(r => r.id));
                      } else {
                        setSelectedRevisions([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Editor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
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
              {revisions.map((revision, index) => (
                <tr key={revision.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRevisions.includes(revision.id)}
                      onChange={() => handleRevisionSelect(revision.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{revision.id}
                        {index === 0 && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                    {revision.revisionNotes && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {revision.revisionNotes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getChangeTypeBadge(revision.changeType)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {revision.editor?.displayName || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {revision.performance && (
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 dark:text-white">
                          #{revision.performance.rank}
                        </div>
                        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          Score: {revision.performance.performanceScore}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(revision.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/posts/${id}/revisions/${revision.id}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleRevert(revision.id)}
                        disabled={index === 0}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Revert
                      </button>
                      <button
                        onClick={() => handleDeleteRevision(revision.id)}
                        disabled={index === 0}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                Showing {((pagination.pageNumber || 1) - 1) * (pagination.pageSize || 20) + 1} to{' '}
                {Math.min((pagination.pageNumber || 1) * (pagination.pageSize || 20), pagination.totalCount || 0)} of{' '}
                {pagination.totalCount || 0} revisions
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange((pagination.pageNumber || 1) - 1)}
                  disabled={(pagination.pageNumber || 1) === 1}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + Math.max(1, (pagination.pageNumber || 1) - 2);
                  if (page > pagination.totalPages) return null;
                  return (
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
                  );
                })}
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

      {/* Bulk Actions */}
      {selectedRevisions.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRevisions.length} revision(s) selected
            </span>
            <button
              onClick={handleCompareRevisions}
              disabled={selectedRevisions.length !== 2}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50"
            >
              Compare
            </button>
            <button
              onClick={() => setSelectedRevisions([])}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostRevisions;
