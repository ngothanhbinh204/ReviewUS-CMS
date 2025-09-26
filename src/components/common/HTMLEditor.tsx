import React, { useState, useRef, useCallback } from 'react';
import { Eye, Code, Image, Bold, Italic, List, ListOrdered, Link, Type } from 'lucide-react';

interface HTMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onImageInsert?: () => void;
}

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  value,
  onChange,
  className = '',
  onImageInsert
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current selection in textarea
  const getSelection = useCallback(() => {
    if (!textareaRef.current) return null;
    const textarea = textareaRef.current;
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      selectedText: value.substring(textarea.selectionStart, textarea.selectionEnd)
    };
  }, [value]);

  // Insert text at cursor position or replace selection
  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef.current) return;
    
    const selection = getSelection();
    if (!selection) return;

    let newText: string;
    if (selection.selectedText) {
      // Wrap selected text
      newText = before + selection.selectedText + after;
    } else {
      // Insert with placeholder
      newText = before + placeholder + after;
    }

    const newValue = value.substring(0, selection.start) + newText + value.substring(selection.end);
    onChange(newValue);

    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = selection.start + before.length + (selection.selectedText || placeholder).length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, onChange, getSelection]);

  // Formatting functions
  const formatBold = () => insertText('<strong>', '</strong>', 'bold text');
  const formatItalic = () => insertText('<em>', '</em>', 'italic text');
  const formatH1 = () => insertText('<h1>', '</h1>', 'Heading 1');
  const formatH2 = () => insertText('<h2>', '</h2>', 'Heading 2');
  const formatH3 = () => insertText('<h3>', '</h3>', 'Heading 3');
  const formatParagraph = () => insertText('<p>', '</p>', 'Your paragraph text');
  const formatUL = () => insertText('<ul>\n  <li>', '</li>\n</ul>', 'List item');
  const formatOL = () => insertText('<ol>\n  <li>', '</li>\n</ol>', 'List item');
  const formatLink = () => insertText('<a href="https://example.com">', '</a>', 'link text');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'Enter':
          // Auto-continue lists
          e.preventDefault();
          const selection = getSelection();
          if (selection) {
            const currentLine = value.substring(0, selection.start).split('\n').pop() || '';
            if (currentLine.trim().startsWith('<li>')) {
              insertText('\n  <li>', '</li>', 'List item');
            } else {
              insertText('\n', '', '');
            }
          }
          break;
      }
    }
  };

  return (
    <div className={`${className} border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-1">
          {/* Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-gray-800 rounded border mr-3">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-l ${
                mode === 'edit'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Code size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-r ${
                mode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          {/* Formatting Tools */}
          {mode === 'edit' && (
            <div className="flex items-center gap-1">
              {/* Typography */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={formatH1}
                  className="flex items-center px-2 py-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Heading 1 (H1)"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={formatH2}
                  className="flex items-center px-2 py-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Heading 2 (H2)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={formatH3}
                  className="flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Heading 3 (H3)"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={formatParagraph}
                  className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Paragraph (P)"
                >
                  <Type size={14} />
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              {/* Text Formatting */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={formatBold}
                  className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={formatItalic}
                  className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={14} />
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              {/* Lists */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={formatUL}
                  className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Unordered List"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={formatOL}
                  className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Ordered List"
                >
                  <ListOrdered size={14} />
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              {/* Link & Image */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={formatLink}
                  className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Insert Link"
                >
                  <Link size={14} />
                </button>
                {onImageInsert && (
                  <button
                    type="button"
                    onClick={onImageInsert}
                    className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    title="Insert Image"
                  >
                    <Image size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {value.length} characters
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full h-[400px] p-4 font-mono text-sm border-none resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Enter your HTML content here...

Tips:
- Select text and click formatting buttons to wrap it
- Use Ctrl+B for bold, Ctrl+I for italic  
- Use Ctrl+Enter to continue lists
- Switch to Preview to see the result"
          />
        ) : (
          <div className="p-4 min-h-[400px] prose prose-sm max-w-none dark:prose-invert
                         prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6
                         prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5
                         prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                         prose-p:mb-4 prose-p:leading-7
                         prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         prose-strong:font-bold prose-em:italic
                         prose-img:rounded-lg prose-img:shadow-md">
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
          <span>💡 Select text and use formatting buttons, or type HTML directly. Ctrl+B = Bold, Ctrl+I = Italic</span>
        ) : (
          <span>👁️ Preview mode - This is how your content will appear to readers</span>
        )}
      </div>
    </div>
  );
};

export default HTMLEditor;