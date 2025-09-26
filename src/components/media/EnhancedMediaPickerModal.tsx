import React, { useState, useCallback, useEffect } from 'react';
import { MediaDto } from '../../types/media.types';
import { useMedia } from '../../hooks/useMedia';
import { MediaGrid } from './MediaGrid';
import { MediaFilters } from './MediaFilters';
import { MediaUpload } from './MediaUpload';
import { ImageVariantSelector, ImageVariant } from './ImageVariantSelector';

interface EnhancedMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaDto | MediaDto[], htmlCode?: string) => void;
  onImageInsert?: (htmlCode: string) => void; // New prop for inserting HTML code
  multiple?: boolean;
  allowedTypes?: string[];
  maxSelection?: number;
  title?: string;
  showUpload?: boolean;
  mode?: 'select' | 'insert'; // New prop to determine the mode
}

export const EnhancedMediaPickerModal: React.FC<EnhancedMediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onImageInsert,
  multiple = false,
  allowedTypes = ['image/*'],
  maxSelection = multiple ? 10 : 1,
  title = 'Select Media',
  showUpload = true,
  mode = 'select'
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedMediaForVariant, setSelectedMediaForVariant] = useState<MediaDto | null>(null);
  const [localSelectedItems, setLocalSelectedItems] = useState<MediaDto[]>([]);

  const {
    items,
    loading,
    error,
    pagination,
    filters,
    goToPage,
    changePageSize,
    applyFilters,
    resetFilters,
    refresh
  } = useMedia();

  // Only refresh if modal opens and no items exist
  useEffect(() => {
    if (isOpen && items.length === 0 && loading !== 'loading') {
      console.log('Modal opened with no items, refreshing media...');
      refresh();
    }
  }, [isOpen]); // Only depend on isOpen

  // Handle search
  const handleSearch = useCallback((query: string) => {
    applyFilters({ search: query });
  }, [applyFilters]);

  const handleMediaClick = useCallback((media: MediaDto) => {
    if (mode === 'insert' && media.mimeType?.startsWith('image/')) {
      // For insert mode with images, show variant selector
      setSelectedMediaForVariant(media);
      setShowVariantSelector(true);
    } else {
      // For select mode or non-images, use regular selection
      if (multiple) {
        const isSelected = localSelectedItems.some(item => item.id === media.id);
        if (isSelected) {
          setLocalSelectedItems(prev => prev.filter(item => item.id !== media.id));
        } else if (localSelectedItems.length < maxSelection) {
          setLocalSelectedItems(prev => [...prev, media]);
        }
      } else {
        onSelect(media);
        onClose();
      }
    }
  }, [mode, multiple, maxSelection, localSelectedItems, onSelect, onClose]);

  const handleVariantSelect = useCallback((media: MediaDto, _variant: ImageVariant, htmlCode: string) => {
    if (onImageInsert) {
      onImageInsert(htmlCode);
    } else {
      onSelect(media, htmlCode);
    }
    setShowVariantSelector(false);
    onClose();
  }, [onImageInsert, onSelect, onClose]);

  const handleConfirmSelection = useCallback(() => {
    if (localSelectedItems.length > 0) {
      onSelect(localSelectedItems);
      onClose();
    }
  }, [localSelectedItems, onSelect, onClose]);

  const handleUploadComplete = useCallback((uploadedMedia: MediaDto[]) => {
    refresh();
    setShowUploadModal(false);
    
    // Auto-select uploaded media in select mode
    if (mode === 'select') {
      if (multiple) {
        const newSelection = [...localSelectedItems];
        uploadedMedia.forEach(media => {
          if (newSelection.length < maxSelection && !newSelection.some(item => item.id === media.id)) {
            newSelection.push(media);
          }
        });
        setLocalSelectedItems(newSelection);
      } else if (uploadedMedia.length > 0) {
        onSelect(uploadedMedia[0]);
        onClose();
      }
    }
  }, [refresh, mode, multiple, maxSelection, localSelectedItems, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              {mode === 'insert' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click on an image to choose size and insert into content
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters & Upload */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <MediaFilters
                filters={filters}
                onFiltersChange={applyFilters}
                onReset={resetFilters}
                onSearch={handleSearch}
              />
              
              {showUpload && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload New
                </button>
              )}
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading === 'loading' ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading media...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : (
              <MediaGrid
                items={items}
                viewMode="grid"
                selectedItems={localSelectedItems}
                selectionMode={multiple}
                onMediaClick={handleMediaClick}
                loading={false}
              />
            )}
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-500">
                  Showing {items.length} of {pagination.totalCount} items
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(pagination.pageNumber - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {pagination.pageNumber} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(pagination.pageNumber + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {multiple && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {localSelectedItems.length} of {maxSelection} selected
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setLocalSelectedItems([])}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={localSelectedItems.length === 0}
                >
                  Clear Selection
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={localSelectedItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Select ({localSelectedItems.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Image Variant Selector */}
      {showVariantSelector && selectedMediaForVariant && (
        <ImageVariantSelector
          isOpen={showVariantSelector}
          onClose={() => {
            setShowVariantSelector(false);
            setSelectedMediaForVariant(null);
          }}
          media={selectedMediaForVariant}
          onSelect={handleVariantSelect}
        />
      )}
    </>
  );
};
