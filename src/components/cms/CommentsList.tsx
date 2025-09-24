import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  author_name: string;
  author_email: string;
  author_url?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  created_at: string;
  updated_at: string;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
  replies?: Comment[];
  replies_count: number;
}

interface CommentsListProps {
  postId?: string;
}

const CommentsList: React.FC<CommentsListProps> = ({ postId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', page, status, search, postId, user?.current_tenant_id],
    queryFn: () => commentsApi.getAll({
      page,
      limit: 20,
      status: status !== 'all' ? status as any : undefined,
      search: search || undefined,
      post_id: postId,
    }),
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Comment['status'] }) =>
      commentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment status updated');
    },
    onError: () => {
      toast.error('Failed to update comment status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: Comment['status'] }) =>
      commentsApi.bulkUpdate(ids, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comments updated');
      setSelectedComments(new Set());
    },
    onError: () => {
      toast.error('Failed to update comments');
    },
  });

  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());

  const handleStatusChange = (commentId: string, newStatus: Comment['status']) => {
    updateStatusMutation.mutate({ id: commentId, status: newStatus });
  };

  const handleDelete = (commentId: string, authorName: string) => {
    if (window.confirm(`Are you sure you want to delete the comment by "${authorName}"?`)) {
      deleteMutation.mutate(commentId);
    }
  };

  const handleBulkAction = (action: Comment['status'] | 'delete') => {
    const selectedIds = Array.from(selectedComments);
    if (selectedIds.length === 0) {
      toast.error('No comments selected');
      return;
    }

    if (action === 'delete') {
      if (window.confirm(`Delete ${selectedIds.length} selected comment(s)?`)) {
        Promise.all(selectedIds.map(id => commentsApi.delete(id)))
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success('Comments deleted');
            setSelectedComments(new Set());
          })
          .catch(() => toast.error('Failed to delete comments'));
      }
    } else {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: action });
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId);
    } else {
      newSelected.add(commentId);
    }
    setSelectedComments(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map((c: Comment) => c.id)));
    }
  };

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getStatusColor = (status: Comment['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-100';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-800 dark:text-warning-100';
      case 'spam':
        return 'bg-error-100 text-error-800 dark:bg-error-800 dark:text-error-100';
      case 'trash':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

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
        Failed to load comments. Please try again.
      </div>
    );
  }

  const comments = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.total || 0) / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-title-md font-semibold text-gray-900 dark:text-white">
            Comments {postId ? 'for Post' : 'Management'}
          </h1>
          <p className="text-theme-sm text-gray-600 dark:text-gray-400">
            Moderate and manage user comments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Comments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="spam">Spam</option>
              <option value="trash">Trash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {selectedComments.size > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bulk Actions ({selectedComments.size} selected)
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approved')}
                  className="px-3 py-2 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('spam')}
                  className="px-3 py-2 bg-warning-500 text-white rounded-lg text-sm hover:bg-warning-600"
                >
                  Mark Spam
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 bg-error-500 text-white rounded-lg text-sm hover:bg-error-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm overflow-hidden">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No comments found</div>
            <p className="text-gray-500">No comments match your current filters.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedComments.size === comments.length && comments.length > 0}
                  onChange={toggleSelectAll}
                  className="mr-3 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Select All
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedComments.has(comment.id)}
                      onChange={() => toggleCommentSelection(comment.id)}
                      className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.author_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {comment.author_email}
                            </p>
                            {comment.author_url && (
                              <a
                                href={comment.author_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-brand-600 hover:text-brand-800"
                              >
                                {comment.author_url}
                              </a>
                            )}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(comment.status)}`}>
                            {comment.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.replies_count > 0 && (
                            <button
                              onClick={() => toggleExpanded(comment.id)}
                              className="text-sm text-brand-600 hover:text-brand-800"
                            >
                              {expandedComments.has(comment.id) ? 'Hide' : 'Show'} replies ({comment.replies_count})
                            </button>
                          )}
                        </div>
                      </div>

                      {comment.post && !postId && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            On: <span className="font-medium">{comment.post.title}</span>
                          </p>
                        </div>
                      )}

                      <div className="mt-3">
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center space-x-4">
                        {comment.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'approved')}
                            className="text-sm text-success-600 hover:text-success-800"
                          >
                            Approve
                          </button>
                        )}
                        {comment.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'pending')}
                            className="text-sm text-warning-600 hover:text-warning-800"
                          >
                            Unapprove
                          </button>
                        )}
                        {comment.status !== 'spam' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'spam')}
                            className="text-sm text-warning-600 hover:text-warning-800"
                          >
                            Spam
                          </button>
                        )}
                        {comment.status !== 'trash' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'trash')}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Trash
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id, comment.author_name)}
                          className="text-sm text-error-600 hover:text-error-800"
                        >
                          Delete Permanently
                        </button>
                      </div>

                      {/* Replies */}
                      {expandedComments.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-8 space-y-4">
                          {comment.replies.map((reply: Comment) => (
                            <div key={reply.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {reply.author_name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {reply.author_email}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reply.status)}`}>
                                    {reply.status}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-gray-900 dark:text-white whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentsList;
