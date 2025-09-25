// =================================================================
// MEDIA GRID COMPONENT
// =================================================================

import React, { useState, useCallback } from 'react';
import { MediaDto, UpdateMediaDto } from '../../types/media.types';
import { mediaService } from '../../services/mediaService';

interface MediaGridProps {
  items: MediaDto[];
  viewMode: 'grid' | 'list';
  selectedItems: MediaDto[];
  selectionMode?: boolean;
  onMediaClick: (media: MediaDto) => void;
  onMediaUpdate?: (id: string, data: UpdateMediaDto) => Promise<MediaDto>;
  onMediaDelete?: (id: string) => Promise<void>;
  loading?: boolean;
}

interface MediaItemProps {
  media: MediaDto;
  isSelected: boolean;
  selectionMode: boolean;
  viewMode: 'grid' | 'list';
  onMediaClick: (media: MediaDto) => void;
  onMediaUpdate?: (id: string, data: UpdateMediaDto) => Promise<MediaDto>;
  onMediaDelete?: (id: string) => Promise<void>;
}

// =================================================================
// MEDIA ITEM COMPONENT
// =================================================================

const MediaItem: React.FC<MediaItemProps> = ({
  media,
  isSelected,
  selectionMode,
  viewMode,
  onMediaClick,
  onMediaUpdate,
  onMediaDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMediaClick(media);
  }, [onMediaClick, media]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onMediaDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${media.alt || 'this media'}"?`)) {
      setIsDeleting(true);
      try {
        await onMediaDelete(media.id);
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [onMediaDelete, media]);

  const getMediaTypeIcon = useCallback((mimeType?: string) => {
    if (!mimeType) return null;
    
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.startsWith('video/')) {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }, []);

  const getPreferredVariant = useCallback((variants?: MediaDto['variants']) => {
    if (!variants || variants.length === 0) return null;
    
    // Prefer medium size for grid view, thumbnail for list view
    const preferredSize = viewMode === 'grid' ? 'medium' : 'thumbnail';
    return variants.find(v => v.size === preferredSize) || variants[0];
  }, [viewMode]);

  const renderThumbnail = useCallback(() => {
    const preferredVariant = getPreferredVariant(media.variants);
    const imageUrl = preferredVariant?.url || media.url;
    
    if (media.mimeType?.startsWith('image/')) {
      return (
        <img
          src={imageUrl}
          alt={media.alt || 'Media thumbnail'}
          className={`${
            viewMode === 'grid' 
              ? 'w-full h-32 object-cover' 
              : 'w-16 h-16 object-cover'
          } rounded-lg`}
          loading="lazy"
        />
      );
    }
    
    if (media.mimeType?.startsWith('video/')) {
      return (
        <div className={`${
          viewMode === 'grid' 
            ? 'w-full h-32' 
            : 'w-16 h-16'
        } bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center`}>
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    
    // Default file icon
    return (
      <div className={`${
        viewMode === 'grid' 
          ? 'w-full h-32' 
          : 'w-16 h-16'
      } bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }, [media, viewMode, getPreferredVariant]);

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div 
        className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isSelected 
                ? 'bg-indigo-600 border-indigo-600'
                : 'bg-white border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Media Type Badge */}
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow">
            {getMediaTypeIcon(media.mimeType)}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="p-2">
          {renderThumbnail()}
        </div>

        {/* Info */}
        <div className="p-3 pt-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {media.alt || media.meta?.title || 'Untitled'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{mediaService.formatFileSize(media.fileSize || 0)}</span>
            {media.usageCount > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Used {media.usageCount}x
              </span>
            )}
          </div>
          {media.dimensions && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {media.dimensions.width} × {media.dimensions.height}
            </p>
          )}
        </div>

        {/* Actions */}
        {(showActions || isDeleting) && !selectionMode && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center space-x-2">
            <button
              onClick={handleClick}
              className="bg-white text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100"
            >
              View
            </button>
            {onMediaDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div 
      className={`flex items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={handleClick}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="mr-4">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected 
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-white border-gray-300'
          }`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="flex-shrink-0 mr-4">
        {renderThumbnail()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          {getMediaTypeIcon(media.mimeType)}
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate ml-2">
            {media.alt || media.meta?.title || 'Untitled'}
          </p>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-4">
          <span>{mediaService.formatFileSize(media.fileSize || 0)}</span>
          {media.dimensions && (
            <span>{media.dimensions.width} × {media.dimensions.height}</span>
          )}
          {media.usageCount > 0 && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Used {media.usageCount}x
            </span>
          )}
          <span>{new Date(media.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      {!selectionMode && (
        <div className="flex-shrink-0 ml-4">
          {onMediaDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// =================================================================
// MEDIA GRID MAIN COMPONENT
// =================================================================

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  viewMode,
  selectedItems,
  selectionMode = false,
  onMediaClick,
  onMediaUpdate,
  onMediaDelete,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading media...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No media files found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or upload some files.
        </p>
      </div>
    );
  }

  return (
    <div className={`${
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        : 'space-y-2'
    }`}>
      {items.map((media) => (
        <MediaItem
          key={media.id}
          media={media}
          isSelected={selectedItems.some(item => item.id === media.id)}
          selectionMode={selectionMode}
          viewMode={viewMode}
          onMediaClick={onMediaClick}
          onMediaUpdate={onMediaUpdate}
          onMediaDelete={onMediaDelete}
        />
      ))}
    </div>
  );
};
