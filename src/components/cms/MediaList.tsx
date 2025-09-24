import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Media {
  id: string;
  url: string;
  alt: string;
  file_size: number;
  mime_type: string;
  dimensions?: { width: number; height: number };
  created_at: string;
  usage_count: number;
  is_shared: boolean;
}

const MediaList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['media', page, search, user?.current_tenant_id],
    queryFn: () => mediaApi.getAll({
      page,
      limit: 20,
      search: search || undefined,
    }),
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata?: any }) =>
      mediaApi.upload(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media uploaded successfully');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: () => {
      toast.error('Failed to upload media');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media deleted successfully');
      setSelectedMedia(null);
    },
    onError: () => {
      toast.error('Failed to delete media');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      mediaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media updated successfully');
      setSelectedMedia(null);
    },
    onError: () => {
      toast.error('Failed to update media');
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadMutation.mutate({ file });
      });
    }
  };

  const handleDelete = (media: Media) => {
    if (window.confirm(`Are you sure you want to delete "${media.alt || 'this media'}"?`)) {
      deleteMutation.mutate(media.id);
    }
  };

  const handleUpdateMedia = (data: { alt: string; is_shared: boolean }) => {
    if (selectedMedia) {
      updateMutation.mutate({
        id: selectedMedia.id,
        data,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const mediaItems = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.total || 0) / 20);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg">
        Failed to load media. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-title-md font-semibold text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="text-theme-sm text-gray-600 dark:text-gray-400">
            Manage your images, videos and files
          </p>
        </div>
        <div className="flex space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*,.pdf,.doc,.docx"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Media
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename or alt text..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm overflow-hidden">
        <div className="p-6">
          {mediaItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No media files</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading a file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaItems.map((media: Media) => (
                <div
                  key={media.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedMedia(media)}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {media.mime_type.startsWith('image/') ? (
                      <img
                        src={media.url}
                        alt={media.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : media.mime_type.startsWith('video/') ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMedia(media);
                        }}
                        className="bg-white text-gray-900 px-2 py-1 rounded text-xs hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(media);
                        }}
                        className="bg-error-500 text-white px-2 py-1 rounded text-xs hover:bg-error-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {media.alt || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatFileSize(media.file_size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Media Details</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedMedia.mime_type.startsWith('image/') ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt}
                    className="w-full rounded-lg"
                  />
                ) : selectedMedia.mime_type.startsWith('video/') ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedMedia.alt}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter alt text for accessibility"
                    onBlur={(e) => {
                      if (e.target.value !== selectedMedia.alt) {
                        handleUpdateMedia({
                          alt: e.target.value,
                          is_shared: selectedMedia.is_shared,
                        });
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={selectedMedia.is_shared}
                      onChange={(e) => {
                        handleUpdateMedia({
                          alt: selectedMedia.alt,
                          is_shared: e.target.checked,
                        });
                      }}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Share with other tenants
                    </span>
                  </label>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">File Size:</span> {formatFileSize(selectedMedia.file_size)}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedMedia.mime_type}
                  </div>
                  {selectedMedia.dimensions && (
                    <div>
                      <span className="font-medium">Dimensions:</span>{' '}
                      {selectedMedia.dimensions.width} × {selectedMedia.dimensions.height}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Upload Date:</span>{' '}
                    {new Date(selectedMedia.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Usage Count:</span> {selectedMedia.usage_count}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedMedia.url)}
                    className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaList;
