// =================================================================
// MEDIA UPLOAD COMPONENT
// =================================================================

import React, { useState, useCallback, useRef } from 'react';
import { MediaDto, CreateMediaDto } from '../../types/media.types';
import { mediaService } from '../../services/mediaService';

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (media: MediaDto[]) => void;
  onUploadError?: (error: string) => void;
  allowedTypes?: string[];
  maxFileSize?: number;           // in bytes
  maxFiles?: number;
  showProgress?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: MediaDto;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  onUploadError,
  allowedTypes = ['image/*', 'video/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  showProgress = true
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =================================================================
  // FILE VALIDATION
  // =================================================================

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size ${mediaService.formatFileSize(file.size)} exceeds maximum allowed size ${mediaService.formatFileSize(maxFileSize)}`;
    }

    return null;
  }, [allowedTypes, maxFileSize]);

  // =================================================================
  // FILE HANDLING
  // =================================================================

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadingFiles.length + fileArray.length > maxFiles) {
      onUploadError?.(`Cannot upload more than ${maxFiles} files at once`);
      return;
    }

    const validFiles: UploadingFile[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          progress: 0,
          status: 'pending'
        });
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploadingFiles(prev => [...prev, ...validFiles]);
    }
  }, [uploadingFiles.length, maxFiles, validateFile, onUploadError]);

  // =================================================================
  // DRAG & DROP
  // =================================================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // =================================================================
  // FILE INPUT
  // =================================================================

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // =================================================================
  // UPLOAD LOGIC
  // =================================================================

  const uploadSingleFile = useCallback(async (uploadingFile: UploadingFile, index: number): Promise<MediaDto | null> => {
    try {
      // Update status to uploading
      setUploadingFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'uploading', progress: 0 } : item
      ));

      const createData: CreateMediaDto = {
        file: uploadingFile.file,
        alt: uploadingFile.file.name,
        title: uploadingFile.file.name
      };

      // Note: In real implementation, you might want to track upload progress
      // This would require implementing progress tracking in the mediaService
      const response = await mediaService.uploadMedia(createData);

      if (response.success && response.data) {
        // Update status to success
        setUploadingFiles(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            status: 'success', 
            progress: 100,
            result: response.data!
          } : item
        ));

        return response.data;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      // Update status to error
      setUploadingFiles(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          status: 'error', 
          progress: 0,
          error: error.message
        } : item
      ));

      return null;
    }
  }, []);

  const startUpload = useCallback(async () => {
    if (uploadingFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = uploadingFiles.map((file, index) => 
        uploadSingleFile(file, index)
      );

      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<MediaDto | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value!)
        .filter(Boolean);

      const failed = results.filter(result => 
        result.status === 'rejected' || result.value === null
      ).length;

      if (successful.length > 0) {
        onUploadComplete?.(successful);
      }

      if (failed > 0) {
        onUploadError?.(`${failed} file(s) failed to upload`);
      }

      // Auto-close if all successful
      if (failed === 0) {
        setTimeout(() => {
          onClose();
          setUploadingFiles([]);
        }, 1500);
      }
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [uploadingFiles, uploadSingleFile, onUploadComplete, onUploadError, onClose]);

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  const removeFile = useCallback((index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setUploadingFiles([]);
  }, []);

  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.startsWith('video/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }, []);

  if (!isOpen) return null;

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upload Media Files
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isUploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Drop files here to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              or
            </p>
            <button
              onClick={openFileDialog}
              className="btn btn-primary"
              disabled={isUploading}
            >
              Choose Files
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Max {maxFiles} files • {mediaService.formatFileSize(maxFileSize)} per file
            </p>
          </div>

          {/* File List */}
          {uploadingFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Files ({uploadingFiles.length})
                </h4>
                {!isUploading && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {uploadingFiles.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {/* File Icon */}
                    <div className="flex-shrink-0 mr-3">
                      {getFileIcon(item.file.type)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mediaService.formatFileSize(item.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {showProgress && item.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {item.error && (
                        <p className="text-xs text-red-500 mt-1">{item.error}</p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex-shrink-0 ml-3">
                      {item.status === 'pending' && !isUploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {item.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                      )}
                      
                      {item.status === 'success' && (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      
                      {item.status === 'error' && (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {uploadingFiles.length > 0 && (
              <span>
                {uploadingFiles.filter(f => f.status === 'success').length} of {uploadingFiles.length} uploaded
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            
            {uploadingFiles.length > 0 && !isUploading && (
              <button
                onClick={startUpload}
                className="btn btn-primary"
                disabled={uploadingFiles.every(f => f.status === 'success')}
              >
                Start Upload
              </button>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
