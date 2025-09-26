import React, { useState, useEffect } from 'react';
import { X, Upload, Search, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaDto } from '../../types/media.types';

interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, alt?: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  isOpen,
  onClose,
  onSelectImage
}) => {
  const [images, setImages] = useState<MediaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getMedia({ 
        pageNumber: 1, 
        pageSize: 50, 
        mimeType: 'image/*',
        includeShared: true 
      });
      
      console.log('ImageManager API response:', response); // Debug log
      
      // Handle actual API response structure: { items: [], totalCount: number, ... }
      const mediaItems = (response as any).items || response.data || [];
      setImages(Array.isArray(mediaItems) ? mediaItems : []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]); // Clear images on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      let successCount = 0;
      
      for (const file of files) {
        try {
          const response = await mediaService.uploadMedia({
            file,
            alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            title: file.name,
            description: `Uploaded image: ${file.name}`,
          });
          
          // Check if upload was successful
          if (response.success || response.data) {
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      if (successCount > 0) {
        // Refresh the entire list to ensure sync with database
        await fetchImages();
        console.log(`Successfully uploaded ${successCount} out of ${files.length} images`);
      }

      const failedCount = files.length - successCount;
      if (failedCount > 0) {
        console.warn(`Failed to upload ${failedCount} images`);
        alert(`Warning: ${failedCount} images failed to upload`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Helper function to get best image variant for display
  const getImageUrl = (image: MediaDto, preferredSize: 'thumbnail' | 'medium' | 'large' | 'full' = 'medium') => {
    // For GCS URLs, use the main URL which follows format:
    // https://storage.googleapis.com/reviewus-bucket-132/filename.webp
    if (image.url && image.url.includes('storage.googleapis.com/reviewus-bucket-132')) {
      // If variants exist for thumbnail display
      if (preferredSize === 'thumbnail' && image.variants && image.variants.length > 0) {
        const thumbnail = image.variants.find(v => v.size === 'thumbnail');
        if (thumbnail?.url) return thumbnail.url;
      }
      return image.url; // Return main GCS URL
    }
    
    // Fallback: if variants exist, use preferred size
    if (image.variants && image.variants.length > 0) {
      const preferred = image.variants.find(v => v.size === preferredSize);
      if (preferred) return preferred.url;
      
      // Fallback to first available variant
      return image.variants[0].url;
    }
    
    // Final fallback to main URL
    return image.url;
  };

  const getImageDisplayName = (image: MediaDto) => {
    return image.meta?.title || image.alt || `Media ${image.id.slice(0, 8)}`;
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const filteredImages = images.filter(img => 
    (img.alt && img.alt.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (img.meta?.title && img.meta.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Image Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="multipleImageUpload"
            />
            <label
              htmlFor="multipleImageUpload"
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Images'}
            </label>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ImageIcon size={48} className="mb-4" />
              <p>No images found</p>
              <p className="text-sm">Upload some images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                  onClick={() => onSelectImage(image.url, image.alt)}
                >
                  <img
                    src={getImageUrl(image, 'thumbnail')}
                    alt={image.alt || getImageDisplayName(image)}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(image.url, image.id);
                        }}
                        className="p-1 bg-white text-gray-700 rounded hover:bg-gray-100"
                        title="Copy URL"
                      >
                        {copiedId === image.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
                    <div className="truncate">{getImageDisplayName(image)}</div>
                    {image.dimensions && (
                      <div className="text-xs text-gray-300">
                        {image.dimensions.width}×{image.dimensions.height}
                        {image.fileSize && ` • ${formatFileSize(image.fileSize)}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageManager;