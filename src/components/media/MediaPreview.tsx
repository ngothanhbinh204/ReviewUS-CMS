// =================================================================
// MEDIA PREVIEW MODAL COMPONENT
// =================================================================

import React, { useState, useCallback } from 'react';
import { MediaDto, UpdateMediaDto } from '../../types/media.types';
import { mediaService } from '../../services/mediaService';

interface MediaPreviewProps {
  media: MediaDto;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, data: UpdateMediaDto) => Promise<MediaDto>;
  onDelete?: (id: string) => Promise<void>;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateMediaDto>({
    alt: media.alt || '',
    title: media.meta?.title || '',
    description: media.meta?.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      await onUpdate(media.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update media:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onUpdate, media.id, editData]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${media.alt || 'this media'}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(media.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete media:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, media, onClose]);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      // Show success feedback (could integrate with toast notification)
      alert('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, [media.url]);

  const renderMediaContent = useCallback(() => {
    if (media.mimeType?.startsWith('image/')) {
      return (
        <img
          src={media.url}
          alt={media.alt || 'Media preview'}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      );
    }

    if (media.mimeType?.startsWith('video/')) {
      return (
        <video
          src={media.url}
          controls
          className="max-w-full max-h-96 rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (media.mimeType?.startsWith('audio/')) {
      return (
        <div className="p-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <audio
            src={media.url}
            controls
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    // Document or other file type
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This file type cannot be previewed
        </p>
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download
        </a>
      </div>
    );
  }, [media]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {media.alt || media.meta?.title || 'Media Preview'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {media.mimeType} • {mediaService.formatFileSize(media.fileSize || 0)}
              {media.dimensions && (
                <span> • {media.dimensions.width}×{media.dimensions.height}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Edit Toggle */}
            {onUpdate && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isSaving || isDeleting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-h-[calc(90vh-200px)]">
          {/* Media Preview */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
            {renderMediaContent()}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            {isEditing ? (
              /* Edit Form */
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Edit Media Details
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={editData.alt || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, alt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Describe this image..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Media title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Media description..."
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Media Info */
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Media Details
                </h4>
                
                {/* File Info */}
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                    <span className="ml-2 font-medium">{mediaService.formatFileSize(media.fileSize || 0)}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium">{media.mimeType}</span>
                  </div>
                  
                  {media.dimensions && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                      <span className="ml-2 font-medium">
                        {media.dimensions.width} × {media.dimensions.height}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(media.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                    <span className="ml-2 font-medium">{media.usageCount} times</span>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={media.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100 text-sm"
                    />
                    <button
                      onClick={copyUrl}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Variants */}
                {media.variants && media.variants.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Sizes
                    </label>
                    <div className="space-y-2">
                      {media.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <span className="text-sm font-medium capitalize">{variant.size}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {variant.dimensions.width}×{variant.dimensions.height}
                            </span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(variant.url)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                          >
                            Copy URL
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Download
              </a>
              <button
                onClick={copyUrl}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
              >
                Copy URL
              </button>
            </div>
            
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
