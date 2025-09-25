// =================================================================
// MEDIA PICKER MODAL - FOR POST EDITOR
// =================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { MediaDto, MediaQueryParams } from '../../types/media.types';
import { useMedia } from '../../hooks/useMedia';
import { MediaGrid } from './MediaGrid';
import { MediaFilters } from './MediaFilters';
import { MediaUpload } from './MediaUpload';
import { mediaService } from '../../services/mediaService';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaDto | MediaDto[]) => void;
  multiple?: boolean;
  allowedTypes?: string[];
  maxSelection?: number;
  title?: string;
  showUpload?: boolean;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes = ['image/*'],
  maxSelection = multiple ? 10 : 1,
  title = 'Select Media',
  showUpload = true
}) => {
  const {
    items,
    loading,
    error,
    pagination,
    filters,
    selectedItems,
    uploadMedia,
    selectMedia,
    deselectMedia,
    clearSelection,
    toggleSelection,
    goToPage,
    changePageSize,
    applyFilters,
    resetFilters,
    refresh
  } = useMedia();

  // =================================================================
  // LOCAL STATE
  // =================================================================

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [localSelectedItems, setLocalSelectedItems] = useState<MediaDto[]>([]);

  // =================================================================
  // FILTERED ITEMS (BY ALLOWED TYPES)
  // =================================================================

  const filteredItems = useMemo(() => {
    if (!allowedTypes || allowedTypes.length === 0) return items;
    
    return items.filter(item => {
      if (!item.mimeType) return true;
      
      return allowedTypes.some(allowedType => {
        if (allowedType.endsWith('/*')) {
          const baseType = allowedType.replace('/*', '');
          return item.mimeType!.startsWith(baseType);
        }
        return item.mimeType === allowedType;
      });
    });
  }, [items, allowedTypes]);

  // =================================================================
  // SELECTION HANDLERS
  // =================================================================

  const handleMediaClick = useCallback((media: MediaDto) => {
    if (multiple) {
      // Check max selection limit
      if (maxSelection && localSelectedItems.length >= maxSelection && 
          !localSelectedItems.some(item => item.id === media.id)) {
        return; // Don't allow more selections
      }
      
      const isCurrentlySelected = localSelectedItems.some(item => item.id === media.id);
      if (isCurrentlySelected) {
        setLocalSelectedItems(prev => prev.filter(item => item.id !== media.id));
      } else {
        setLocalSelectedItems(prev => [...prev, media]);
      }
    } else {
      // Single selection - select and close immediately
      onSelect(media);
      onClose();
    }
  }, [multiple, maxSelection, localSelectedItems, onSelect, onClose]);

  const handleConfirmSelection = useCallback(() => {
    if (localSelectedItems.length > 0) {
      if (multiple) {
        onSelect(localSelectedItems);
      } else {
        onSelect(localSelectedItems[0]);
      }
    }
    onClose();
  }, [localSelectedItems, multiple, onSelect, onClose]);

  // =================================================================
  // UPLOAD HANDLERS
  // =================================================================

  const handleUploadComplete = useCallback(async (files: File[], metadata?: any) => {
    try {
      await uploadMedia(files, metadata);
      setShowUploadModal(false);
      
      // Auto-refresh to show new items
      refresh();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadMedia, refresh]);

  // =================================================================
  // FILTER HANDLERS
  // =================================================================

  const handleFiltersChange = useCallback((newFilters: Partial<MediaQueryParams>) => {
    applyFilters(newFilters);
  }, [applyFilters]);

  const handleSearch = useCallback((query: string) => {
    applyFilters({ ...filters, search: query, pageNumber: 1 });
  }, [applyFilters, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {multiple ? (
                <>
                  Select up to {maxSelection} media files
                  {localSelectedItems.length > 0 && ` • ${localSelectedItems.length} selected`}
                </>
              ) : (
                'Click on a media file to select it'
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {showUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                disabled={loading === 'uploading'}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(90vh - 140px)' }}>
          <div className="h-full overflow-y-auto p-6">
            {/* Filters */}
            <div className="mb-4">
              <MediaFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                onReset={resetFilters}
                allowedTypes={allowedTypes}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredItems.length} of {pagination.totalCount} items
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                  <button
                    onClick={() => refresh()}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading === 'loading' && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading media...</p>
              </div>
            )}

            {/* Media Grid */}
            {loading !== 'loading' && filteredItems.length > 0 && (
              <MediaGrid
                items={filteredItems}
                viewMode={viewMode}
                selectedItems={localSelectedItems}
                selectionMode={true}
                onMediaClick={handleMediaClick}
                loading={loading === 'uploading'}
              />
            )}

            {/* Empty State */}
            {loading !== 'loading' && filteredItems.length === 0 && !error && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No media files found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or upload some files.
                </p>
                {showUpload && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload Media
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(pagination.pageNumber - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {pagination.pageNumber} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(pagination.pageNumber + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => changePageSize(parseInt(e.target.value))}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {multiple && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {localSelectedItems.length} of {maxSelection} selected
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setLocalSelectedItems([])}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={localSelectedItems.length === 0}
              >
                Clear Selection
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={localSelectedItems.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Select ({localSelectedItems.length})
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <MediaUpload
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadComplete={handleUploadComplete}
            allowedTypes={allowedTypes}
            maxFiles={10}
          />
        )}
      </div>
    </div>
  );
};
