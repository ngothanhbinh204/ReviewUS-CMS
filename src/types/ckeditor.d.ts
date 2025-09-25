declare module '../CKEditor/index' {
  import React from 'react';
  
  interface CKEditor5Props {
    value: string;
    onChange: (data: string) => void;
    accessToken?: string;
    onUpload?: (data: any) => void;
  }

  const CKEditor5: React.ComponentType<CKEditor5Props>;
  export default CKEditor5;
}
