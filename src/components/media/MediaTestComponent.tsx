import React from 'react';

// Test component để verify GCS URL structure
export const MediaTestComponent: React.FC = () => {
  const sampleMediaData = {
    "id": "f9e8d7c6-b5a4-3210-9876-543210fedcb0",
    "url": "https://storage.googleapis.com/reviewus-bucket-132/1758835337_52a1ca44-6608-4809-b786-a0553c90c629.webp",
    "alt": "Sample image alt text",
    "meta": {
      "title": "Beautiful landscape",
      "description": "A stunning view of mountains",
      "caption": "Mountain landscape at sunset",
      "custom": {}
    },
    "createdAt": "2025-09-26T10:30:00Z",
    "fileSize": 1024000,
    "mimeType": "image/webp",
    "dimensions": {
      "width": 1920,
      "height": 1080,
      "aspectRatio": 1.777
    },
    "variants": [
      {
        "size": "thumbnail",
        "url": "https://storage.googleapis.com/reviewus-bucket-132/thumb_1758835337_52a1ca44-6608-4809-b786-a0553c90c629.webp",
        "dimensions": { "width": 150, "height": 84, "aspectRatio": 1.777 },
        "fileSize": 15000
      },
      {
        "size": "medium", 
        "url": "https://storage.googleapis.com/reviewus-bucket-132/med_1758835337_52a1ca44-6608-4809-b786-a0553c90c629.webp",
        "dimensions": { "width": 500, "height": 281, "aspectRatio": 1.777 },
        "fileSize": 45000
      },
      {
        "size": "large",
        "url": "https://storage.googleapis.com/reviewus-bucket-132/lg_1758835337_52a1ca44-6608-4809-b786-a0553c90c629.webp", 
        "dimensions": { "width": 1024, "height": 576, "aspectRatio": 1.777 },
        "fileSize": 120000
      },
      {
        "size": "full",
        "url": "https://storage.googleapis.com/reviewus-bucket-132/1758835337_52a1ca44-6608-4809-b786-a0553c90c629.webp",
        "dimensions": { "width": 1920, "height": 1080, "aspectRatio": 1.777 },
        "fileSize": 1024000
      }
    ],
    "seoData": null,
    "usageCount": 0,
    "updatedAt": "2025-09-26T10:30:00Z"
  };

  const generateImageHtml = (media: typeof sampleMediaData, variant: 'thumbnail' | 'medium' | 'large' | 'full' = 'full') => {
    const selectedVariant = media.variants.find(v => v.size === variant) || media.variants[media.variants.length - 1];
    const imageUrl = selectedVariant?.url || media.url;
    const dimensions = selectedVariant?.dimensions || media.dimensions;

    return `<figure class="image">
  <img 
    src="${imageUrl}" 
    alt="${media.alt}" 
    width="${dimensions.width}"
    height="${dimensions.height}"
    style="max-width: 100%; height: auto;" 
    loading="lazy"
  />
  <figcaption>${media.meta.caption || media.meta.title}</figcaption>
</figure>`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🖼️ GCS Media Integration Test</h2>
      
      {/* Sample Data Display */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📋 Sample Media Data Structure</h3>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(sampleMediaData, null, 2)}
        </pre>
      </div>

      {/* Image Variants Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">🎨 Image Variants Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sampleMediaData.variants.map((variant) => (
            <div key={variant.size} className="border rounded-lg p-3">
              <div className="font-medium text-sm mb-2 capitalize">{variant.size}</div>
              <div className="text-xs text-gray-600 mb-2">
                {variant.dimensions.width}×{variant.dimensions.height}
              </div>
              <div className="text-xs text-gray-500">
                {(variant.fileSize / 1024).toFixed(1)} KB
              </div>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                {variant.url}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated HTML Examples */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">🔧 Generated HTML Examples</h3>
        
        <div className="space-y-4">
          {(['thumbnail', 'medium', 'large', 'full'] as const).map((size) => (
            <div key={size} className="border rounded-lg p-4">
              <div className="font-medium mb-2 capitalize">{size} Variant</div>
              <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                {generateImageHtml(sampleMediaData, size)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">🚀 API Endpoints</h3>
        <div className="space-y-3">
          <div className="p-3 border rounded">
            <code className="text-green-600 font-medium">POST /api/media/upload</code>
            <div className="text-sm text-gray-600 mt-1">Upload to Google Cloud Storage</div>
          </div>
          <div className="p-3 border rounded">
            <code className="text-blue-600 font-medium">GET /api/media?mimeType=image/*&includeShared=true</code>
            <div className="text-sm text-gray-600 mt-1">Get paginated media list</div>
          </div>
          <div className="p-3 border rounded">
            <code className="text-purple-600 font-medium">GET /api/media/{`{id}`}</code>
            <div className="text-sm text-gray-600 mt-1">Get single media with variants</div>
          </div>
        </div>
      </div>

      {/* Usage in PostForm */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">💡 Usage in PostForm</h3>
        <ul className="text-sm space-y-2">
          <li>✅ <strong>ImageManager</strong>: Shows thumbnails for fast loading</li>
          <li>✅ <strong>HTMLEditor</strong>: Uses full-size GCS URLs for content</li>
          <li>✅ <strong>PostForm</strong>: Preserves responsive image HTML</li>
          <li>✅ <strong>Database</strong>: Stores full GCS URLs (no relative paths)</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaTestComponent;