import React, { useState, useRef, useEffect } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight, Trash2, Move, Image as ImageIcon } from 'lucide-react';
import { EnhancedMediaPickerModal } from '../media/EnhancedMediaPickerModal';
import { MediaDto } from '../../types/media.types';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageElement: HTMLImageElement;
  onUpdate: (newHtml: string) => void;
  onDelete: () => void;
}

interface ImageSettings {
  src: string;
  alt: string;
  caption: string;
  alignment: 'left' | 'center' | 'right' | 'none';
  size: 'small' | 'medium' | 'large' | 'full';
  width?: string;
  height?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  imageElement,
  onUpdate,
  onDelete
}) => {
  const [settings, setSettings] = useState<ImageSettings>({
    src: '',
    alt: '',
    caption: '',
    alignment: 'none',
    size: 'medium'
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse current image settings
  useEffect(() => {
    if (!imageElement) return;

    const parseImageSettings = () => {
      const src = imageElement.getAttribute('src') || '';
      const alt = imageElement.getAttribute('alt') || '';
      
      // Check if image is wrapped in figure with caption
      const figure = imageElement.closest('figure');
      const caption = figure?.querySelector('figcaption')?.textContent || '';
      
      // Parse alignment from classes or parent styles
      let alignment: 'left' | 'center' | 'right' | 'none' = 'none';
      const classList = imageElement.className;
      if (classList.includes('align-left')) alignment = 'left';
      else if (classList.includes('align-center')) alignment = 'center';
      else if (classList.includes('align-right')) alignment = 'right';
      else if (figure?.classList.contains('text-center')) alignment = 'center';
      else if (figure?.classList.contains('text-left')) alignment = 'left';
      else if (figure?.classList.contains('text-right')) alignment = 'right';

      // Parse size from classes
      let size: 'small' | 'medium' | 'large' | 'full' = 'medium';
      if (classList.includes('w-1/4') || classList.includes('max-w-xs')) size = 'small';
      else if (classList.includes('w-1/2') || classList.includes('max-w-md')) size = 'medium';
      else if (classList.includes('w-3/4') || classList.includes('max-w-lg')) size = 'large';
      else if (classList.includes('w-full')) size = 'full';

      setSettings({
        src,
        alt,
        caption,
        alignment,
        size,
        width: imageElement.getAttribute('width') || undefined,
        height: imageElement.getAttribute('height') || undefined
      });
    };

    parseImageSettings();
  }, [imageElement]);

  // Generate HTML based on current settings
  const generateImageHtml = () => {
    const alignmentClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      none: ''
    }[settings.alignment];

    const sizeClass = {
      small: 'max-w-xs',
      medium: 'max-w-md',
      large: 'max-w-lg',
      full: 'w-full'
    }[settings.size];

    const imgTag = `<img src="${settings.src}" alt="${settings.alt}" class="${sizeClass} h-auto ${settings.alignment !== 'none' ? `mx-auto` : ''}" ${settings.width ? `width="${settings.width}"` : ''} ${settings.height ? `height="${settings.height}"` : ''} />`;

    if (settings.caption) {
      return `<figure class="${alignmentClass} my-4">
  ${imgTag}
  <figcaption class="text-sm text-gray-600 mt-2 italic">${settings.caption}</figcaption>
</figure>`;
    }

    return settings.alignment !== 'none' 
      ? `<div class="${alignmentClass} my-4">${imgTag}</div>`
      : `<div class="my-4">${imgTag}</div>`;
  };

  const handleUpdate = () => {
    const newHtml = generateImageHtml();
    onUpdate(newHtml);
    onClose();
  };

  const handleMediaSelect = (media: MediaDto | MediaDto[], htmlCode?: string) => {
    if (htmlCode) {
      // Parse the new image src from htmlCode
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCode, 'text/html');
      const newImg = doc.querySelector('img');
      if (newImg) {
        setSettings(prev => ({
          ...prev,
          src: newImg.getAttribute('src') || prev.src,
          alt: newImg.getAttribute('alt') || prev.alt
        }));
      }
    } else {
      const mediaItem = Array.isArray(media) ? media[0] : media;
      if (mediaItem) {
        setSettings(prev => ({
          ...prev,
          src: mediaItem.url,
          alt: mediaItem.alt || 'Image'
        }));
      }
    }
    setShowMediaPicker(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={onClose} />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 w-96 max-h-[90vh] overflow-y-auto"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Edit Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Image Preview */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className={`${settings.alignment !== 'none' ? `text-${settings.alignment}` : ''}`}>
              <img
                src={settings.src}
                alt={settings.alt}
                className={`${
                  settings.size === 'small' ? 'max-w-xs' :
                  settings.size === 'medium' ? 'max-w-md' :
                  settings.size === 'large' ? 'max-w-lg' : 'w-full'
                } h-auto max-h-32 ${settings.alignment !== 'none' ? 'mx-auto' : ''}`}
              />
              {settings.caption && (
                <p className="text-sm text-gray-600 mt-2 italic">{settings.caption}</p>
              )}
            </div>
          </div>

          {/* Change Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Source
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.src}
                onChange={(e) => setSettings(prev => ({ ...prev, src: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Image URL"
              />
              <button
                onClick={() => setShowMediaPicker(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Browse
              </button>
            </div>
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={settings.alt}
              onChange={(e) => setSettings(prev => ({ ...prev, alt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="Describe the image"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              value={settings.caption}
              onChange={(e) => setSettings(prev => ({ ...prev, caption: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="Image caption"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'full'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings(prev => ({ ...prev, size }))}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    settings.size === size
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alignment
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setSettings(prev => ({ ...prev, alignment: 'none' }))}
                className={`p-2 rounded-md border transition-colors ${
                  settings.alignment === 'none'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="No alignment"
              >
                <Move size={16} />
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, alignment: 'left' }))}
                className={`p-2 rounded-md border transition-colors ${
                  settings.alignment === 'left'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Align left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, alignment: 'center' }))}
                className={`p-2 rounded-md border transition-colors ${
                  settings.alignment === 'center'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Align center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, alignment: 'right' }))}
                className={`p-2 rounded-md border transition-colors ${
                  settings.alignment === 'right'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Align right"
              >
                <AlignRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <EnhancedMediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        mode="insert"
        title="Replace Image"
        allowedTypes={['image']}
        multiple={false}
      />
    </>
  );
};

export default ImageEditor;
