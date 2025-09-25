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
  const [previewMedia, setPreviewMedia] = useState<MediaDto | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

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

  const handleBulkAction = useCallback((action: string, mediaIds: string[]) => {
    switch (action) {
      case 'delete':
        bulkDeleteMedia(mediaIds);
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
  }, [bulkDeleteMedia, selectMedia, clearSelection, filteredItems]);

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
            </p>
          </div>
          
          {showUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
              disabled={loading === 'uploading'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Media
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <MediaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedItems.length}
        totalCount={filteredItems.length}
        onBulkAction={(action) => setShowBulkActions(true)}
        onRefresh={refresh}
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
          onClose={() => setShowBulkActions(false)}
        />
      )}

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No media files</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by uploading your first media file.
          </p>
          {showUpload && (
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// =================================================================
// MEDIA LIBRARY STYLES
// =================================================================

// Add to your CSS/Tailwind config
const mediaLibraryStyles = `
.media-library {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow;
}

.media-library-header {
  @apply border-b border-gray-200 dark:border-gray-700 pb-4;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200;
}
`;
