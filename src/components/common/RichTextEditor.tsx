import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={className}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'link', '|',
            'bulletedList', 'numberedList', '|',
            'indent', 'outdent', '|',
            'blockQuote', 'insertTable', '|',
            'undo', 'redo'
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
              { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
              { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
            ]
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
          }
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        onReady={(editor) => {
          console.log('Standard CKEditor is ready!', editor);
          console.log('Initial data:', value);
        }}
      />
    </div>
  );
};

export default RichTextEditor;