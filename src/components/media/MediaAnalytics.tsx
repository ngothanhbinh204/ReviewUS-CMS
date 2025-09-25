import React, { useState, useEffect } from "react";
import { useMediaAnalytics } from "../../hooks/useMedia";
import { MediaAnalyticsDto } from "../../types/media.types";

interface MediaAnalyticsProps {}

export const MediaAnalytics: React.FC<MediaAnalyticsProps> = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { 
    analytics, 
    loading, 
    error,
    refresh 
  } = useMediaAnalytics();

  useEffect(() => {
    refresh();
  }, [dateRange, refresh]);

  if (loading !== 'idle' && loading !== 'success' && loading !== 'error') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const storageData = [
    { type: 'images', size: analytics.storageByType.images, count: analytics.filesByType.images },
    { type: 'videos', size: analytics.storageByType.videos, count: analytics.filesByType.videos },
    { type: 'documents', size: analytics.storageByType.documents, count: analytics.filesByType.documents },
    { type: 'others', size: analytics.storageByType.others, count: analytics.filesByType.others },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Media Analytics
        </h2>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' },
          ].map((option) => (
            <button
              key={option.value}
              className={`px-3 py-1 text-sm rounded-md ${
                dateRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setDateRange(option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {formatNumber(analytics.totalFiles)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {formatFileSize(analytics.totalStorage)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {formatNumber(analytics.mostUsedMedia.length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Most Used</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {formatNumber(analytics.unusedMedia.length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unused Files</div>
          </div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Storage Breakdown by Type
        </h3>
        <div className="space-y-4">
          {storageData.map((item, index) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-4 h-4 rounded ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {item.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatFileSize(item.size)} ({item.count} files)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Used Media */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Most Used Media
        </h3>
        <div className="space-y-3">
          {analytics.mostUsedMedia.slice(0, 10).map((media) => (
            <div key={media.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {media.alt || 'Untitled'}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {media.usageCount} uses
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={loading !== 'idle' && loading !== 'success'}
        >
          {loading !== 'idle' && loading !== 'success' ? 'Refreshing...' : 'Refresh Analytics'}
        </button>
      </div>
    </div>
  );
};
