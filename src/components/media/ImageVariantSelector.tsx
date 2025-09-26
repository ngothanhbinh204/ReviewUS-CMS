import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { MediaDto } from '../../types/media.types';

export interface ImageVariant {
  name: string;
  label: string;
  maxWidth?: number;
  maxHeight?: number;
  description: string;
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  {
    name: 'thumbnail',
    label: 'Thumbnail',
    maxWidth: 150,
    maxHeight: 150,
    description: 'Small size for previews'
  },
  {
    name: 'medium',
    label: 'Medium',
    maxWidth: 500,
    maxHeight: 500,
    description: 'Good for most content'
  },
  {
    name: 'large',
    label: 'Large',
    maxWidth: 1024,
    maxHeight: 1024,
    description: 'High quality display'
  },
  {
    name: 'full',
    label: 'Full Size',
    description: 'Original dimensions'
  }
];

interface ImageVariantSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaDto;
  onSelect: (media: MediaDto, variant: ImageVariant, htmlCode: string) => void;
}

export const ImageVariantSelector: React.FC<ImageVariantSelectorProps> = ({
  isOpen,
  onClose,
  media,
  onSelect
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ImageVariant>(IMAGE_VARIANTS[1]); // Default to medium
  const [alignment, setAlignment] = useState<'none' | 'left' | 'center' | 'right'>('none');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState(media.alt || '');

  if (!isOpen) return null;

  const generateImageHtml = (variant: ImageVariant, align: string, caption: string, alt: string) => {
    let imageTag = `<img src="${media.url}" alt="${alt}"`;
    
    // Add dimensions if specified
    if (variant.maxWidth) {
      imageTag += ` style="max-width: ${variant.maxWidth}px; height: auto;"`;
    }
    
    // Add alignment class
    if (align !== 'none') {
      const alignmentClasses = {
        left: 'float-left mr-4 mb-4',
        center: 'mx-auto block mb-4',
        right: 'float-right ml-4 mb-4'
      };
      imageTag += ` class="${alignmentClasses[align as keyof typeof alignmentClasses]}"`;
    }
    
    imageTag += ' />';
    
    // Wrap in figure if caption exists
    if (caption.trim()) {
      let figureClass = '';
      if (align === 'center') {
        figureClass = ' class="text-center"';
      } else if (align === 'left') {
        figureClass = ' class="float-left mr-4 mb-4"';
      } else if (align === 'right') {
        figureClass = ' class="float-right ml-4 mb-4"';
      }
      
      return `<figure${figureClass}>
  ${imageTag}
  <figcaption class="text-sm text-gray-600 mt-2">${caption}</figcaption>
</figure>`;
    }
    
    return imageTag;
  };

  const handleInsert = () => {
    const htmlCode = generateImageHtml(selectedVariant, alignment, caption, altText);
    onSelect(media, selectedVariant, htmlCode);
    onClose();
  };

  const getPreviewDimensions = (variant: ImageVariant) => {
    if (!media.dimensions) return null;
    
    const { width, height } = media.dimensions;
    
    if (!variant.maxWidth && !variant.maxHeight) {
      return { width, height };
    }
    
    const maxW = variant.maxWidth || width;
    const maxH = variant.maxHeight || height;
    
    const ratio = Math.min(maxW / width, maxH / height, 1);
    
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Insert Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Settings */}
          <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-600 overflow-y-auto">
            <div className="space-y-6">
              {/* Image Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Image Details
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                      <img 
                        src={media.url} 
                        alt={media.alt || 'Preview'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {media.alt || 'Untitled'}
                      </p>
                      {media.dimensions && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {media.dimensions.width} × {media.dimensions.height} pixels
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Image Size
                </h3>
                <div className="space-y-3">
                  {IMAGE_VARIANTS.map((variant) => {
                    const dimensions = getPreviewDimensions(variant);
                    return (
                      <label
                        key={variant.name}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVariant.name === variant.name
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="variant"
                          value={variant.name}
                          checked={selectedVariant.name === variant.name}
                          onChange={() => setSelectedVariant(variant)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {variant.label}
                            </span>
                            {dimensions && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {dimensions.width} × {dimensions.height}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {variant.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Alignment
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }
                  ].map((align) => (
                    <button
                      key={align.value}
                      type="button"
                      onClick={() => setAlignment(align.value as any)}
                      className={`px-3 py-2 text-sm rounded border transition-colors ${
                        alignment === align.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Caption (Optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add a caption that will appear below the image"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Preview
              </h3>
              
              {/* Visual Preview */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: generateImageHtml(selectedVariant, alignment, caption, altText) 
                  }}
                />
              </div>

              {/* HTML Code Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTML Code
                </h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                  <pre>{generateImageHtml(selectedVariant, alignment, caption, altText)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ImageIcon size={16} />
              Insert Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
