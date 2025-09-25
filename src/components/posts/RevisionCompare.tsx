import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { postService } from '../../services/postService';
import { PostRevisionCompareDto, FieldDifference } from '../../types/post.types';

const RevisionCompare: React.FC = () => {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const fromRevision = parseInt(searchParams.get('from') || '0');
  const toRevision = parseInt(searchParams.get('to') || '0');

  const [comparison, setComparison] = useState<PostRevisionCompareDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId && fromRevision && toRevision) {
      fetchComparison();
    }
  }, [postId, fromRevision, toRevision]);

  const fetchComparison = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      const response = await postService.compareRevisions(postId, {
        fromRevision,
        toRevision
      });
      setComparison(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to compare revisions');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldDifference = (field: string, diff: FieldDifference) => {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 dark:text-white capitalize">
          {field} Changes
        </h3>
        
        {diff.added.length > 0 && (
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Added:</h4>
            <div className="space-y-2">
              {diff.added.map((item, index) => (
                <div key={index} className="text-green-700 dark:text-green-300 text-sm font-mono bg-white dark:bg-green-900/30 p-2 rounded">
                  + {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {diff.removed.length > 0 && (
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Removed:</h4>
            <div className="space-y-2">
              {diff.removed.map((item, index) => (
                <div key={index} className="text-red-700 dark:text-red-300 text-sm font-mono bg-white dark:bg-red-900/30 p-2 rounded">
                  - {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {diff.changed.length > 0 && (
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Modified:</h4>
            <div className="space-y-3">
              {diff.changed.map((change, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-red-700 dark:text-red-300 text-sm font-mono bg-white dark:bg-red-900/30 p-2 rounded">
                    - {change.from}
                  </div>
                  <div className="text-green-700 dark:text-green-300 text-sm font-mono bg-white dark:bg-green-900/30 p-2 rounded">
                    + {change.to}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No comparison data available.</p>
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
            <Link to={`/posts/${postId}/revisions`} className="hover:text-gray-700 dark:hover:text-gray-300">
              Revisions
            </Link>
            <span>/</span>
            <span>Compare</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compare Revisions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comparing revision #{fromRevision} with revision #{toRevision}
          </p>
        </div>
        <Link
          to={`/posts/${postId}/revisions`}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          Back to Revisions
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comparison Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {comparison.summary.totalChanges}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Changes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {comparison.summary.majorChanges}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Major Changes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {comparison.summary.minorChanges}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Minor Changes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {((comparison.summary.totalChanges - comparison.summary.majorChanges) / Math.max(comparison.summary.totalChanges, 1) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Minor/Total</div>
          </div>
        </div>
      </div>

      {/* Revision Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Revision */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revision #{comparison.fromRevision.id} (From)
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Editor:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {comparison.fromRevision.editor?.displayName || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatDateTime(comparison.fromRevision.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {comparison.fromRevision.changeType}
              </span>
            </div>
            {comparison.fromRevision.revisionNotes && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                <p className="ml-2 text-gray-600 dark:text-gray-400 mt-1">
                  {comparison.fromRevision.revisionNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* To Revision */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revision #{comparison.toRevision.id} (To)
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Editor:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {comparison.toRevision.editor?.displayName || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatDateTime(comparison.toRevision.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {comparison.toRevision.changeType}
              </span>
            </div>
            {comparison.toRevision.revisionNotes && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                <p className="ml-2 text-gray-600 dark:text-gray-400 mt-1">
                  {comparison.toRevision.revisionNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Differences */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Detailed Changes
        </h2>

        {/* Title Changes */}
        {comparison.differences.title && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {renderFieldDifference('title', comparison.differences.title)}
          </div>
        )}

        {/* Excerpt Changes */}
        {comparison.differences.excerpt && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {renderFieldDifference('excerpt', comparison.differences.excerpt)}
          </div>
        )}

        {/* Body Changes */}
        {comparison.differences.body && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {renderFieldDifference('body', comparison.differences.body)}
          </div>
        )}

        {/* SEO Changes */}
        {comparison.differences.seoMeta && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {renderFieldDifference('SEO Meta', comparison.differences.seoMeta)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (!postId) return;
              const confirmed = window.confirm('Revert to revision #' + fromRevision + '?');
              if (confirmed) {
                try {
                  await postService.revertToRevision(postId, fromRevision);
                  window.location.href = `/posts/${postId}/revisions`;
                } catch (err: any) {
                  alert('Failed to revert: ' + err.message);
                }
              }
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
          >
            Revert to Revision #{fromRevision}
          </button>
          <button
            onClick={async () => {
              if (!postId) return;
              const confirmed = window.confirm('Revert to revision #' + toRevision + '?');
              if (confirmed) {
                try {
                  await postService.revertToRevision(postId, toRevision);
                  window.location.href = `/posts/${postId}/revisions`;
                } catch (err: any) {
                  alert('Failed to revert: ' + err.message);
                }
              }
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
          >
            Revert to Revision #{toRevision}
          </button>
        </div>
      </div>

      {/* No Changes Message */}
      {comparison.summary.totalChanges === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Changes Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            These two revisions are identical.
          </p>
        </div>
      )}
    </div>
  );
};

export default RevisionCompare;
