# API Specifications for ReviewUS-CMS Media Management

## 1. Media Analytics API

### Endpoint: `GET /api/media/analytics`

**Description**: Returns analytics data for media files including storage statistics, usage patterns, and trends.

**Response Format**:
```json
{
  "success": true,
  "message": "Analytics data retrieved successfully",
  "data": {
    "totalStorage": 1572864000,
    "totalFiles": 342,
    "filesByType": {
      "images": 245,
      "videos": 23,
      "documents": 67,
      "others": 7
    },
    "storageByType": {
      "images": 892743680,
      "videos": 524288000,
      "documents": 134217728,
      "others": 21614592
    },
    "uploadTrends": [
      {
        "date": "2025-09-20",
        "count": 12,
        "size": 45678900
      },
      {
        "date": "2025-09-21",
        "count": 8,
        "size": 23456789
      }
    ],
    "mostUsedMedia": [
      {
        "id": "cm1kz9xyz123",
        "url": "https://storage.example.com/images/logo.png",
        "alt": "Company Logo",
        "usageCount": 45
      },
      {
        "id": "cm1kz9xyz124",
        "url": "https://storage.example.com/images/banner.jpg",
        "alt": "Homepage Banner",
        "usageCount": 32
      }
    ],
    "unusedMedia": [
      {
        "id": "cm1kz9xyz125",
        "url": "https://storage.example.com/images/old-photo.jpg",
        "alt": "Old Photo",
        "createdAt": "2025-08-15T10:30:00Z"
      }
    ]
  },
  "timestamp": "2025-09-26T12:00:00Z"
}
```

**Data Types**:
- `totalStorage`: Total storage in bytes (number)
- `totalFiles`: Total number of files (number)
- `filesByType`: Object with counts for each file type
- `storageByType`: Object with storage sizes in bytes for each type
- `uploadTrends`: Array of daily upload statistics (last 30 days)
- `mostUsedMedia`: Array of top 20 most referenced media files
- `unusedMedia`: Array of files not referenced anywhere

---

## 2. Media List API

### Endpoint: `GET /api/media`

**Description**: Returns paginated list of media files with optional filtering.

**Query Parameters**:
- `pageNumber` (number): Page number starting from 1
- `pageSize` (number): Number of items per page (default: 12)
- `mimeType` (string): Filter by MIME type (e.g., "image/*", "video/*")
- `search` (string): Search in filename, alt text, title
- `sortBy` (string): Sort field ("createdAt", "fileName", "fileSize")
- `sortOrder` (string): Sort direction ("asc", "desc")

**Example Request**:
```
GET /api/media?pageNumber=1&pageSize=12&mimeType=image/*
```

**Response Format**:
```json
{
  "success": true,
  "message": "Media files retrieved successfully",
  "data": [
    {
      "id": "cm1kz9xyz123",
      "fileName": "company-logo.png",
      "originalFileName": "Logo Design Final.png",
      "mimeType": "image/png",
      "fileSize": 245760,
      "url": "https://storage.example.com/images/company-logo.png",
      "thumbnailUrl": "https://storage.example.com/thumbnails/company-logo_thumb.png",
      "alt": "Company Logo",
      "title": "Main Company Logo",
      "description": "Primary logo used across all platforms",
      "dimensions": {
        "width": 1200,
        "height": 800
      },
      "customMeta": {
        "photographer": "John Doe",
        "location": "Studio A"
      },
      "tags": ["logo", "branding", "official"],
      "isPublic": true,
      "createdAt": "2025-09-15T10:30:00Z",
      "updatedAt": "2025-09-20T14:22:00Z",
      "createdBy": "user123",
      "tenantId": "tenant456"
    }
  ],
  "totalCount": 342,
  "pageNumber": 1,
  "pageSize": 12,
  "totalPages": 29,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "timestamp": "2025-09-26T12:00:00Z"
}
```

**Media Object Fields**:
- `id`: Unique identifier (string)
- `fileName`: Sanitized filename (string)
- `originalFileName`: Original upload filename (string)
- `mimeType`: MIME type (string)
- `fileSize`: Size in bytes (number)
- `url`: Full URL to access the file (string)
- `thumbnailUrl`: URL to thumbnail (optional, for images)
- `alt`: Alt text for accessibility (string, optional)
- `title`: Display title (string, optional)
- `description`: Detailed description (string, optional)
- `dimensions`: Width and height for images/videos (object, optional)
- `customMeta`: Additional metadata (object, optional)
- `tags`: Array of tags (string[], optional)
- `isPublic`: Whether file is publicly accessible (boolean)
- `createdAt`: Creation timestamp (ISO 8601 string)
- `updatedAt`: Last update timestamp (ISO 8601 string)
- `createdBy`: User ID who uploaded (string)
- `tenantId`: Tenant/organization ID (string)

---

## 3. Upload Media API

### Endpoint: `POST /api/media/upload`

**Description**: Upload new media files with metadata.

**Request Format**: `multipart/form-data`

**Form Fields**:
- `file` (required): The file to upload
- `alt` (optional): Alt text for accessibility
- `title` (optional): Display title
- `description` (optional): File description
- `customMeta` (optional): JSON string of additional metadata
- `tags` (optional): Comma-separated tags
- `isPublic` (optional): Boolean, defaults to true

**Example Request**:
```bash
curl -X POST http://192.168.1.83:5000/api/media/upload \
  -F "file=@image.jpg" \
  -F "alt=Beautiful sunset" \
  -F "title=Sunset Photo" \
  -F "description=Taken at the beach during golden hour" \
  -F "tags=sunset,beach,nature" \
  -F "isPublic=true"
```

**Success Response** (HTTP 201):
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "cm1kz9xyz127",
    "fileName": "sunset-photo.jpg",
    "originalFileName": "IMG_20250915_sunset.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 2048000,
    "url": "https://storage.example.com/images/sunset-photo.jpg",
    "thumbnailUrl": "https://storage.example.com/thumbnails/sunset-photo_thumb.jpg",
    "alt": "Beautiful sunset",
    "title": "Sunset Photo",
    "description": "Taken at the beach during golden hour",
    "dimensions": {
      "width": 1920,
      "height": 1280
    },
    "tags": ["sunset", "beach", "nature"],
    "isPublic": true,
    "createdAt": "2025-09-26T12:00:00Z",
    "updatedAt": "2025-09-26T12:00:00Z",
    "createdBy": "user123",
    "tenantId": "tenant456"
  },
  "timestamp": "2025-09-26T12:00:00Z"
}
```

**Error Response** (HTTP 400):
```json
{
  "success": false,
  "message": "Upload failed",
  "errors": [
    "File size exceeds maximum limit of 10MB",
    "File type not supported"
  ],
  "timestamp": "2025-09-26T12:00:00Z"
}
```

---

## 4. Error Handling Guidelines

### Common Error Responses:

**Validation Error (HTTP 400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "File is required",
    "File size must be less than 10MB"
  ],
  "timestamp": "2025-09-26T12:00:00Z"
}
```

**Authentication Error (HTTP 401)**:
```json
{
  "success": false,
  "message": "Unauthorized access",
  "errors": ["Valid authentication token required"],
  "timestamp": "2025-09-26T12:00:00Z"
}
```

**Server Error (HTTP 500)**:
```json
{
  "success": false,
  "message": "Internal server error",
  "errors": ["An unexpected error occurred"],
  "timestamp": "2025-09-26T12:00:00Z"
}
```

---

## 5. Implementation Notes

### File Storage:
- Files should be stored with collision-safe filenames
- Generate thumbnails for images automatically
- Support cloud storage (GCS, S3, etc.)
- Implement proper access control for private files

### Performance:
- Use pagination for large result sets
- Implement caching for frequently accessed data
- Optimize thumbnail generation
- Consider CDN for file delivery

### Security:
- Validate file types and sizes
- Scan uploaded files for malware
- Implement proper access controls
- Use secure URLs for private files

### Database Schema Suggestions:
```sql
CREATE TABLE media (
  id VARCHAR(255) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt TEXT,
  title VARCHAR(500),
  description TEXT,
  dimensions JSONB,
  custom_meta JSONB,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL
);

CREATE INDEX idx_media_tenant ON media(tenant_id);
CREATE INDEX idx_media_mime_type ON media(mime_type);
CREATE INDEX idx_media_created_at ON media(created_at);
CREATE INDEX idx_media_tags ON media USING GIN(tags);
```

This specification should provide clear guidance for implementing the backend APIs that your frontend is expecting.
