// =================================================================
// MEDIA MANAGEMENT TYPE DEFINITIONS
// =================================================================

export interface MediaDto {
  id: string;
  url: string;                    // Public GCS URL or local path
  alt?: string;                   // Alt text for accessibility
  meta?: MediaMetaDto;            // Additional metadata
  createdAt: string;
  fileSize?: number;              // Size in bytes
  mimeType?: string;              // "image/jpeg", "video/mp4", etc.
  dimensions?: MediaDimensionsDto; // Width/height for images
  variants?: MediaVariantDto[];    // Thumbnail, medium, large variants
  seoData?: MediaSeoDto;          // SEO optimization data
  usageCount: number;             // How many times used
  updatedAt: string;
}

export interface CreateMediaDto {
  file: File;                     // The actual file
  alt?: string;
  title?: string;
  description?: string;
  customMeta?: Record<string, any>;
}

export interface UpdateMediaDto {
  alt?: string;
  title?: string;
  description?: string;
  customMeta?: Record<string, any>;
  seoData?: MediaSeoDto;
}

export interface MediaMetaDto {
  title?: string;
  description?: string;
  caption?: string;
  custom?: Record<string, any>;
}

export interface MediaDimensionsDto {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface MediaVariantDto {
  size: string;                   // "thumbnail" | "medium" | "large" | "full"
  url: string;                    // URL to variant
  dimensions: MediaDimensionsDto;
  fileSize: number;
}

export interface MediaSeoDto {
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  keywords?: string[];
}

// =================================================================
// MEDIA SHARING TYPES
// =================================================================

export interface MediaShareDto {
  id: string;
  mediaId: string;
  media?: MediaDto;
  sharedWithTenantId: string;
  sharedWithTenantName: string;
  sharedByTenantId: string;
  sharedByTenantName: string;
  sharedAt: string;
  expiresAt?: string;
  shareType: string;              // "read" | "write"
  isActive: boolean;
}

export interface CreateMediaShareDto {
  mediaId: string;
  sharedWithTenantId: string;
  expiresAt?: string;
  shareType?: string;             // default: "read"
}

// =================================================================
// API QUERY PARAMETERS
// =================================================================

export interface MediaQueryParams {
  pageNumber?: number;            // default: 1
  pageSize?: number;              // default: 20
  mimeType?: string;              // "image/*", "video/*", etc.
  includeShared?: boolean;        // default: true
  search?: string;                // Search by title/alt text
  sortBy?: 'createdAt' | 'updatedAt' | 'fileSize' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

// =================================================================
// UPLOAD & STORAGE TYPES
// =================================================================

export interface UploadResult {
  originalUrl: string;            // GCS URL for original file
  variants: {                     // Auto-generated variants
    thumbnail: string;            // 150px max dimension
    medium: string;               // 500px max dimension
    large: string;                // 1024px max dimension
  };
  metadata: {
    dimensions: { width: number; height: number };
    fileSize: number;
    mimeType: string;
  };
}

export interface GCSConfiguration {
  bucketName: string;             // Your GCS bucket
  credentialsPath: string;        // Service account key path
  defaultAcl: "publicRead";       // Public access for images
  enableCdn: boolean;             // Use CDN for faster delivery
  cdnUrl?: string;                // CDN base URL
}

export interface FileNaming {
  pattern: string;                // "{tenantId}/{type}/{year}/{month}/{uniqueId}-{originalName}"
  example: string;                // "550e8400-e29b-41d4-a716/original/2024/01/abc123-hero-image.jpg"
  variants: string;               // "abc123-hero-image_thumb.jpg"
}

// =================================================================
// CKEDITOR INTEGRATION TYPES
// =================================================================

export interface CKEditorUploadResponse {
  url: string;                    // Direct image URL for embedding
  alt?: string;
  title?: string;
}

export interface CKEditorImageUploadAdapter {
  loader: any;
  token: string;
  tenantId: string;
  upload(): Promise<any>;
}

// =================================================================
// MEDIA USAGE TRACKING
// =================================================================

export interface MediaUsageInfo {
  mediaId: string;
  usageCount: number;
  usedInPosts: string[];          // Array of post IDs
  lastUsedAt?: string;
}

export interface MediaUsageTracking {
  postId: string;
  mediaIds: string[];
  action: 'increment' | 'decrement';
}

// =================================================================
// UI COMPONENT PROPS
// =================================================================

export interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaDto | MediaDto[]) => void;
  multiple?: boolean;
  allowedTypes?: string[];        // ['image/*', 'video/*']
  maxSelection?: number;
}

export interface MediaUploadProps {
  onUploadComplete?: (media: MediaDto[]) => void;
  onUploadError?: (error: string) => void;
  allowedTypes?: string[];
  maxFileSize?: number;           // in bytes
  maxFiles?: number;
  showProgress?: boolean;
}

export interface MediaLibraryProps {
  selectionMode?: boolean;
  onSelect?: (media: MediaDto[]) => void;
  allowedTypes?: string[];
}

// =================================================================
// ANALYTICS & REPORTING
// =================================================================

export interface MediaAnalyticsDto {
  totalStorage: number;           // Total storage used in bytes
  totalFiles: number;             // Total number of files
  filesByType: {
    images: number;
    videos: number;
    documents: number;
    others: number;
  };
  storageByType: {
    images: number;
    videos: number;
    documents: number;
    others: number;
  };
  uploadTrends: {
    date: string;
    count: number;
    size: number;
  }[];
  mostUsedMedia: {
    id: string;
    url: string;
    alt?: string;
    usageCount: number;
  }[];
  unusedMedia: {
    id: string;
    url: string;
    alt?: string;
    createdAt: string;
  }[];
}

// =================================================================
// ERROR HANDLING
// =================================================================

export interface MediaError {
  code: string;
  message: string;
  details?: any;
}

export interface MediaValidationError extends MediaError {
  field: string;
  value: any;
}

// =================================================================
// MEDIA STATES
// =================================================================

export type MediaLoadingState = 'idle' | 'loading' | 'uploading' | 'success' | 'error';

export interface MediaState {
  items: MediaDto[];
  loading: MediaLoadingState;
  error: string | null;
  pagination: {
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  filters: MediaQueryParams;
  selectedItems: MediaDto[];
}
