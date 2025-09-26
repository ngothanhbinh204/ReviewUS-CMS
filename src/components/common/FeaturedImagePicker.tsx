import React, { useState, useEffect } from 'react';
import { X, Image, Upload, Search } from 'lucide-react';
import { MediaDto } from '../../types/media.types';
import { mediaService } from '../../services/mediaService';

interface FeaturedImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaDto) => void;
  selectedMediaId?: string;
}

export const FeaturedImagePicker: React.FC<FeaturedImagePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedMediaId
}) => {
  const [media, setMedia] = useState<MediaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setSearch('');
      setCurrentPage(1);
      setUploadingFiles([]);
      setUploadProgress({});
      setUploadErrors({});
      
      // Fetch fresh data
      fetchMedia();
    }
  }, [isOpen]);

  // Separate effect for page changes and search
  useEffect(() => {
    if (isOpen && (currentPage > 1 || search)) {
      fetchMedia();
    }
  }, [currentPage, search]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaService.getMedia({
        pageNumber: currentPage,
        pageSize: 12,
        search: search || undefined,
        mimeType: 'image/*', // Changed from 'image/png' to 'image/*' to include all image types
      });
      
      console.log('Media API Response:', response); // Debug log
      
      if (response) {
        // Handle the actual API response structure based on console output
        const responseData = response as any;
        
        if (Array.isArray(responseData)) {
          // If response is directly an array
          setMedia(responseData);
          setTotalPages(1);
        } else if (responseData.items && Array.isArray(responseData.items)) {
          // If response has items property (this is our case based on console log)
          setMedia(responseData.items);
          setTotalPages(responseData.totalPages || Math.ceil(responseData.totalCount / responseData.pageSize) || 1);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // If data is directly an array
          setMedia(responseData.data);
          setTotalPages(responseData.totalPages || 1);
        } else if (responseData.data && Array.isArray(responseData.data.items)) {
          // If data has items property
          setMedia(responseData.data.items);
          setTotalPages(responseData.data.totalPages || Math.ceil(responseData.data.totalCount / responseData.data.pageSize) || 1);
        } else if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
          // Standard API response structure
          setMedia(responseData.data);
          setTotalPages(responseData.totalPages || 1);
        } else {
          console.warn('No items found in response:', response);
          setMedia([]);
          setTotalPages(1);
        }
      } else {
        console.error('API response is null or undefined:', response);
        setMedia([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMedia([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia();
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setUploadingFiles(prev => [...prev, ...fileArray]);

    for (const file of fileArray) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        setUploadErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[file.name];
          return newErrors;
        });

        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

        const response = await mediaService.uploadMedia({
          file,
          alt: file.name.split('.')[0],
        });

        console.log('Upload response:', response); // Debug log

        if (response.success && response.data) {
          setMedia(prev => [response.data!, ...prev]);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          // Refresh media list to get latest data from server
          setTimeout(() => {
            fetchMedia();
          }, 100);
          
          // Auto-select newly uploaded image
          setTimeout(() => {
            onSelect(response.data!);
            onClose(); // Close modal after successful upload and selection
          }, 500);
        } else {
          // Handle API error response
          setUploadErrors(prev => ({ 
            ...prev, 
            [file.name]: response.message || 'Upload failed - no data returned'
          }));
          console.error('Upload API response:', response);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        
        // More detailed error handling
        let errorMessage = 'Upload failed - network error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = (error as any).message;
        }
        
        setUploadErrors(prev => ({ 
          ...prev, 
          [file.name]: errorMessage
        }));
        
        // Set progress to 100% to show error state
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } finally {
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
          setUploadErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[file.name];
            return newErrors;
          });
        }, 3000); // Show result for 3 seconds
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Choose Featured Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search & Upload */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <div className="text-blue-700 dark:text-blue-300">
              Debug: Found {media.length} images | Page {currentPage} of {totalPages} | Loading: {loading ? 'Yes' : 'No'}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <form onSubmit={handleSearch} className="flex items-center flex-1 mr-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search images..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Upload Button */}
            <div className="flex items-center space-x-2">
              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => {
                  console.log('Manual refresh triggered');
                  fetchMedia();
                }}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="featured-image-upload"
                />
                <label
                  htmlFor="featured-image-upload"
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition-colors"
                >
                  <Upload size={16} className="mr-2" />
                  Upload New
                </label>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              {uploadingFiles.map(file => (
                <div key={file.name} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {uploadProgress[file.name] === 100 ? 'Complete' : 'Uploading...'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        uploadErrors[file.name] 
                          ? 'bg-red-500' 
                          : uploadProgress[file.name] === 100 
                            ? 'bg-green-500' 
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${uploadProgress[file.name] || 0}%` }}
                    />
                  </div>
                  {uploadErrors[file.name] && (
                    <p className="text-xs text-red-500 mt-1">{uploadErrors[file.name]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedMediaId === item.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                    {item.mimeType?.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.alt || 'Media'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={48} className="text-gray-400" />
                      </div>
                    )}
                    
                    {/* Selection Overlay */}
                    {selectedMediaId === item.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.alt || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.dimensions && `${item.dimensions.width} × ${item.dimensions.height}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <Image size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No images found. Upload new images or try a different search.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Drag and drop images here to upload
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
