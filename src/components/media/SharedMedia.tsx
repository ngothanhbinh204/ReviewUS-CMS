import React, { useState, useEffect } from "react";
import { useMediaSharing } from "../../hooks/useMedia";
import { MediaShareDto } from "../../types/media.types";

interface SharedMediaProps {}

export const SharedMedia: React.FC<SharedMediaProps> = () => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    tenant: '',
    sharedBy: '',
    shareType: '',
  });
  
  const { 
    sharedMedia, 
    myShares,
    loading,
    error,
    revokeShare,
    refresh
  } = useMediaSharing();

  const [activeTab, setActiveTab] = useState<'sharedWithMe' | 'myShares'>('sharedWithMe');

  useEffect(() => {
    refresh();
  }, [activeTab, refresh]);

  const handleRevoke = async (shareId: string) => {
    if (confirm('Are you sure you want to revoke this share?')) {
      await revokeShare(shareId);
      refresh();
    }
  };

  const currentShares = activeTab === 'sharedWithMe' ? sharedMedia : myShares;

  if (loading !== 'idle' && loading !== 'success' && loading !== 'error') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sharedWithMe')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sharedWithMe'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Shared With Me
          </button>
          <button
            onClick={() => setActiveTab('myShares')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'myShares'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Shared Media
          </button>
        </nav>
      </div>

      {/* Basic Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search shared media..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={filters.shareType}
            onChange={(e) => setFilters(prev => ({ ...prev, shareType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Access Types</option>
            <option value="read">Read Only</option>
            <option value="write">Read & Write</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Content */}
      {currentShares && currentShares.length > 0 ? (
        <>
          {/* Share List */}
          <div className="space-y-4">
            {currentShares
              .filter((share: MediaShareDto) => 
                !filters.search || 
                (share.media && (
                  share.media.alt?.toLowerCase().includes(filters.search.toLowerCase()) ||
                  share.media.meta?.title?.toLowerCase().includes(filters.search.toLowerCase())
                ))
              )
              .filter((share: MediaShareDto) => 
                !filters.shareType || share.shareType === filters.shareType
              )
              .map((share: MediaShareDto) => (
              <div 
                key={share.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {share.media && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {share.media.mimeType?.startsWith('image/') ? (
                          <img
                            src={share.media.url}
                            alt={share.media.alt || 'Media'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl text-gray-400">📄</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {share.media?.alt || share.media?.meta?.title || 'Unknown File'}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>
                          {activeTab === 'sharedWithMe' ? 'Shared by' : 'Shared with'}: 
                          <span className="ml-2 font-medium">
                            {activeTab === 'sharedWithMe' ? share.sharedByTenantName : share.sharedWithTenantName}
                          </span>
                        </p>
                        <p>
                          Access: 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            share.shareType === 'write'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {share.shareType === 'write' ? 'Read & Write' : 'Read Only'}
                          </span>
                        </p>
                        <p>
                          Shared: {new Date(share.sharedAt).toLocaleDateString()}
                          {share.expiresAt && (
                            <span className="ml-2 text-orange-600 dark:text-orange-400">
                              (Expires: {new Date(share.expiresAt).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      share.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {share.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    {activeTab === 'myShares' && (
                      <button
                        onClick={() => handleRevoke(share.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📤</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {activeTab === 'sharedWithMe' ? 'No media shared with you' : 'No shared media'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'sharedWithMe' 
              ? 'When others share media with you, it will appear here.'
              : 'Share media with other tenants to collaborate and manage content together.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
