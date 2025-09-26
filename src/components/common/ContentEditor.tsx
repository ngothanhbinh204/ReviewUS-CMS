import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Eye, Code, Maximize2, Minimize2 } from 'lucide-react';

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Start writing your content...'
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<any>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // TinyMCE configuration
  const editorConfig = {
    height: isFullscreen ? 'calc(100vh - 180px)' : 500,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'paste'
    ],
    toolbar: mode === 'edit' ? 
      'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | image media link | code preview | help' : false,
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
      }
      p { margin: 1em 0; }
      img { max-width: 100%; height: auto; }
      .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
        content: attr(data-mce-placeholder);
        color: #9CA3AF;
      }
    `,
    placeholder: placeholder,
    branding: false,
    resize: false,
    statusbar: true,
    paste_data_images: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    file_picker_callback: (cb: any, _value: any, meta: any) => {
      if (meta.filetype === 'image') {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        
        input.onchange = function() {
          const file = (this as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function () {
              cb(reader.result, { title: file.name });
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      }
    },
    images_upload_handler: (blobInfo: any, _progress: any) => new Promise<string>((resolve, reject) => {
      // Convert blob to base64 for now
      // In production, you should upload to your server
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject('Failed to read image');
      };
      reader.readAsDataURL(blobInfo.blob());
    }),
    setup: (editor: any) => {
      editor.on('init', () => {
        // Editor is ready
        if (editorRef.current) {
          editorRef.current = editor;
        }
      });
    }
  };

  const editorContainerClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4'
    : `${className}`;

  return (
    <div className={`${editorContainerClass} border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm`}>
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-lg transition-all ${
                mode === 'edit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Code size={16} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-lg transition-all ${
                mode === 'preview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
            {value.length.toLocaleString()} characters
          </div>
          
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`${isFullscreen ? 'h-full' : 'min-h-[500px]'} flex flex-col`}>
        {mode === 'edit' ? (
          <div className="flex-1 relative">
            <Editor
              apiKey="mxjlvhuwiz4l1yuxio8a89v3krca3xdgdryixa8d98ynzw9x" // You can get a free API key from TinyMCE
              onInit={(evt, editor) => editorRef.current = editor}
              value={value}
              onEditorChange={(content) => onChange(content)}
              init={editorConfig}
            />
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto ${isFullscreen ? 'max-h-screen' : ''}`}>
            <div className="p-6 max-w-4xl mx-auto">
              <article className="post-content prose prose-gray dark:prose-invert max-w-none">
                {value ? (
                  <div dangerouslySetInnerHTML={{ __html: value }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Eye size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
                      Nothing to preview yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
                      Switch to Edit mode to start creating your content
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-4 py-2 text-xs border-t border-gray-200 dark:border-gray-600">
        <div className="text-gray-500 dark:text-gray-400">
          {mode === 'edit' ? 'Rich text editor powered by TinyMCE' : 'Preview mode - switch to Edit to make changes'}
        </div>
      </div>

      {/* Styles for preview content */}
      <style>{`
        .post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .post-content p {
          margin: 16px 0;
          line-height: 1.6;
        }
        .post-content h1, .post-content h2, .post-content h3, .post-content h4 {
          margin: 24px 0 16px 0;
          font-weight: 600;
        }
        .post-content ul, .post-content ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        .post-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #6b7280;
        }
        .post-content pre {
          background: #f3f4f6;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .post-content code {
          background: #f3f4f6;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .tox-tinymce {
          border: none !important;
        }
        .tox .tox-editor-header {
          border-bottom: 1px solid #e5e7eb !important;
        }
      `}</style>
    </div>
  );
};

export default ContentEditor;
