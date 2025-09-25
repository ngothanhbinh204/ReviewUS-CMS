// =================================================================
// MEDIA FILTERS COMPONENT
// =================================================================

import React, { useState, useCallback } from 'react';
import { MediaQueryParams } from '../../types/media.types';

interface MediaFiltersProps {
  filters: MediaQueryParams;
  onFiltersChange: (filters: Partial<MediaQueryParams>) => void;
  onSearch: (query: string) => void;
  onReset: () => void;
  allowedTypes?: string[];
}

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  allowedTypes = ['image/*', 'video/*']
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  const handleFilterChange = useCallback((key: keyof MediaQueryParams, value: any) => {
    onFiltersChange({ [key]: value });
  }, [onFiltersChange]);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          type="submit"
          className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Media Type Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Type:
          </label>
          <select
            value={filters.mimeType || ''}
            onChange={(e) => handleFilterChange('mimeType', e.target.value || undefined)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Types</option>
            {allowedTypes.includes('image/*') && (
              <option value="image/*">Images</option>
            )}
            {allowedTypes.includes('video/*') && (
              <option value="video/*">Videos</option>
            )}
            {allowedTypes.includes('audio/*') && (
              <option value="audio/*">Audio</option>
            )}
            <option value="application/pdf">Documents</option>
          </select>
        </div>

        {/* Include Shared Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={filters.includeShared !== false}
              onChange={(e) => handleFilterChange('includeShared', e.target.checked)}
              className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Include Shared
          </label>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Reset All
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By:
              </label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Modified Date</option>
                <option value="fileSize">File Size</option>
                <option value="usageCount">Usage Count</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order:
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items Per Page:
              </label>
              <select
                value={filters.pageSize || 20}
                onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.search || filters.mimeType || filters.sortBy !== 'createdAt') && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              Search: "{filters.search}"
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
                className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.mimeType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Type: {filters.mimeType}
              <button
                onClick={() => handleFilterChange('mimeType', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.sortBy && filters.sortBy !== 'createdAt' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Sort: {filters.sortBy} ({filters.sortOrder})
              <button
                onClick={() => {
                  handleFilterChange('sortBy', 'createdAt');
                  handleFilterChange('sortOrder', 'desc');
                }}
                className="ml-1 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
