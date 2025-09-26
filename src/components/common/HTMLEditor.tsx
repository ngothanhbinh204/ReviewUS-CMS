import React, { useState } from 'react';
import { Eye, Code, Image, Upload } from 'lucide-react';

interface HTMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        const mediaData = result.data;
        
        // Use the full-size image URL from GCS
        const imageUrl = mediaData.url; // This is now the GCS URL
        const altText = mediaData.alt || file.name;
        const dimensions = mediaData.dimensions || {};
        
        // Create responsive image HTML with GCS URL
        const imageHtml = `\n<figure class="image">
  <img 
    src="${imageUrl}" 
    alt="${altText}" 
    style="max-width: 100%; height: auto;"
    ${dimensions.width ? `width="${dimensions.width}"` : ''}
    ${dimensions.height ? `height="${dimensions.height}"` : ''}
    loading="lazy"
  />
  <figcaption>${altText}</figcaption>
</figure>\n`;
        
        onChange(value + imageHtml);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    }
    
    // Reset file input
    e.target.value = '';
  };

  const insertHtmlTag = (tag: string, content: string = '') => {
    const htmlToInsert = content ? `<${tag}>${content}</${tag}>` : `<${tag}></${tag}>`;
    onChange(value + htmlToInsert);
  };

  return (
    <div className={`${className} border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${
              mode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Code size={14} />
            Edit HTML
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${
              mode === 'preview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Eye size={14} />
            Preview
          </button>
          
          {/* Image Upload */}
          {mode === 'edit' && (
            <div className="flex items-center gap-1">
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUploadInput"
              />
              <label
                htmlFor="imageUploadInput"
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                title="Insert Image"
              >
                <Image size={14} />
                <Upload size={12} />
              </label>
              
              {/* Quick HTML Tags */}
              <button
                type="button"
                onClick={() => insertHtmlTag('h2', 'Heading 2')}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Insert H2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertHtmlTag('h3', 'Heading 3')}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Insert H3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertHtmlTag('strong', 'Bold text')}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Insert Bold"
              >
                <strong>B</strong>
              </button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {value.length} characters
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {mode === 'edit' ? (
          <textarea
            value={value}
            onChange={handleInputChange}
            className="w-full h-[400px] p-4 font-mono text-sm border-none resize-none focus:outline-none dark:bg-gray-800 dark:text-white"
            placeholder="Enter your HTML content here...

Example:
<h2>Heading 2</h2>
<p>Your paragraph content...</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>"
          />
        ) : (
          <div className="p-4 min-h-[400px] prose prose-sm max-w-none dark:prose-invert">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No content to preview</p>
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
        {mode === 'edit' ? (
          <span>💡 Tip: You can use any HTML tags. Switch to Preview mode to see the result.</span>
        ) : (
          <span>👁️ Preview mode - Switch to Edit HTML to modify content.</span>
        )}
      </div>
    </div>
  );
};

export default HTMLEditor;