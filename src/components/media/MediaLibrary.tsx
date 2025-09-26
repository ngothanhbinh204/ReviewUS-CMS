// =================================================================
// MEDIA LIBRARY - MAIN COMPONENT
// =================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { useMedia } from '../../hooks/useMedia';
import { MediaDto, MediaQueryParams } from '../../types/media.types';
import { MediaUpload } from './MediaUpload';
import { MediaGrid } from './MediaGrid';
import { MediaFilters } from './MediaFilters';
import { MediaToolbar } from './MediaToolbar';
import { MediaPagination } from './MediaPagination';
import { MediaPreview } from './MediaPreview';
import { BulkActions } from './BulkActions';

interface MediaLibraryProps {
  selectionMode?: boolean;
  onSelect?: (media: MediaDto[]) => void;
  allowedTypes?: string[];
  maxSelection?: number;
  showUpload?: boolean;
  className?: string;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  selectionMode = false,
  onSelect,
  allowedTypes = ['image/*', 'video/*'],
  maxSelection,
  showUpload = true,
  className = ''
}) => {
  const {
    items,
    loading,
    error,
    pagination,
    filters,
    selectedItems,
    uploadMedia,
    deleteMedia,
    bulkDeleteMedia,
    updateMedia,
    selectMedia,
    clearSelection,
    toggleSelection,
    goToPage,
    changePageSize,
    applyFilters,
    resetFilters,
    refresh,
    forceRefresh
  } = useMedia();

  // =================================================================
  // LOCAL STATE
  // =================================================================

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaDto | null>(null);

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
  // UPLOAD HANDLERS
  // =================================================================

  const handleUploadComplete = useCallback(async () => {
    try {
      setShowUploadModal(false);
      
      // Force refresh to show new items (bypass cache)
      await forceRefresh();
    } catch (error) {
      console.error('Upload refresh failed:', error);
    }
  }, [forceRefresh]);

  // =================================================================
  // SELECTION HANDLERS
  // =================================================================

  const handleMediaClick = useCallback((media: MediaDto) => {
    if (selectionMode) {
      // Check max selection limit
      if (maxSelection && selectedItems.length >= maxSelection && 
          !selectedItems.some(item => item.id === media.id)) {
        return; // Don't allow more selections
      }
      
      toggleSelection(media);
      
      // Call onSelect if provided
      if (onSelect) {
        const isCurrentlySelected = selectedItems.some(item => item.id === media.id);
        const newSelection = isCurrentlySelected
          ? selectedItems.filter(item => item.id !== media.id)
          : [...selectedItems, media];
        
        onSelect(newSelection);
      }
    } else {
      // Preview mode
      setPreviewMedia(media);
    }
  }, [selectionMode, maxSelection, selectedItems, toggleSelection, onSelect]);

  const handleBulkAction = useCallback(async (action: string, mediaIds: string[]) => {
    switch (action) {
      case 'delete':
        await bulkDeleteMedia(mediaIds);
        // Force refresh after delete to ensure UI reflects changes
        setTimeout(() => forceRefresh(), 100);
        break;
      case 'select_all':
        selectMedia(filteredItems);
        break;
      case 'clear_selection':
        clearSelection();
        break;
      default:
        break;
    }
  }, [bulkDeleteMedia, selectMedia, clearSelection, filteredItems, forceRefresh]);

  // =================================================================
  // FILTER HANDLERS
  // =================================================================

  const handleFiltersChange = useCallback((newFilters: Partial<MediaQueryParams>) => {
    applyFilters(newFilters);
  }, [applyFilters]);

  const handleSearch = useCallback((query: string) => {
    applyFilters({ ...filters, search: query, pageNumber: 1 });
  }, [applyFilters, filters]);

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className={`media-library ${className}`}>
      {/* Header */}
      <div className="media-library-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Media Library
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {pagination.totalCount} items • {selectedItems.length} selected
              {/* Cache status indicator */}
              {loading === 'loading' && (
                <span className="ml-2 text-blue-500">
                  • Refreshing...
                </span>
              )}
            </p>
          </div>
          
          {showUpload && (
            <div className="flex gap-2">
              <button
                onClick={() => forceRefresh()}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                disabled={loading === 'loading'}
                title="Force refresh (bypass cache)"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Force Refresh
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
                disabled={loading === 'uploading'}
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Media
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <MediaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedItems.length}
        totalCount={filteredItems.length}
        onBulkAction={(action) => handleBulkAction(action, selectedItems.map(item => item.id))}
        onRefresh={forceRefresh}
        loading={loading === 'loading'}
      />

      {/* Filters */}
      <MediaFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={resetFilters}
        allowedTypes={allowedTypes}
      />

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <BulkActions
          selectedItems={selectedItems}
          onAction={handleBulkAction}
          onClose={() => clearSelection()}
        />
      )}

      {/* Error Display with Cache Info */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div>{error}</div>
              <div className="text-sm text-red-600 mt-1">
                Data may be cached. Try "Force Refresh" to get latest updates.
              </div>
            </div>
            <button
              onClick={() => forceRefresh()}
              className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium"
            >
              Force Refresh
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading === 'loading' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {loading === 'loading' ? 'Fetching fresh data...' : 'Loading media...'}
          </p>
        </div>
      )}

      {/* Media Grid/List */}
      {loading !== 'loading' && filteredItems.length > 0 && (
        <MediaGrid
          items={filteredItems}
          viewMode={viewMode}
          selectedItems={selectedItems}
          selectionMode={selectionMode}
          onMediaClick={handleMediaClick}
          onMediaUpdate={updateMedia}
          onMediaDelete={deleteMedia}
          loading={loading === 'uploading'}
        />
      )}

      {/* Empty State */}
      {loading !== 'loading' && filteredItems.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No media files found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {items.length > 0 
              ? 'No files match your current filters. Try adjusting your search criteria.' 
              : 'Get started by uploading your first media file.'
            }
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() => forceRefresh()}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium"
            >
              Force Refresh
            </button>
            {showUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Media
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <MediaPagination
          pagination={pagination}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
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

      {/* Preview Modal */}
      {previewMedia && (
        <MediaPreview
          media={previewMedia}
          isOpen={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
          onUpdate={updateMedia}
          onDelete={deleteMedia}
        />
      )}
    </div>
  );
};
