// =================================================================
// MEDIA API SERVICE LAYER
// =================================================================

import { apiClient } from './api';
import { ApiResponse, PagedApiResponse } from '../types/api.types';
import { 
  MediaDto, 
  CreateMediaDto, 
  UpdateMediaDto,
  MediaShareDto,
  CreateMediaShareDto,
  MediaQueryParams,
  MediaAnalyticsDto
} from '../types/media.types';

export class MediaService {
  private baseUrl = '/media';
  
  // =================================================================
  // MEDIA CRUD OPERATIONS
  // =================================================================

  /**
   * Upload new media file with metadata
   */
  async uploadMedia(createData: CreateMediaDto): Promise<ApiResponse<MediaDto>> {
    const formData = new FormData();
    formData.append('file', createData.file);
    
    if (createData.alt) formData.append('alt', createData.alt);
    if (createData.title) formData.append('title', createData.title);
    if (createData.description) formData.append('description', createData.description);
    if (createData.customMeta) {
      formData.append('customMeta', JSON.stringify(createData.customMeta));
    }

    const response = await apiClient.post<ApiResponse<MediaDto>>(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get paginated media list with filters
   */
  async getMedia(params?: MediaQueryParams): Promise<PagedApiResponse<MediaDto>> {
    const response = await apiClient.get<PagedApiResponse<MediaDto>>(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Get single media by ID
   */
  async getMediaById(id: string): Promise<ApiResponse<MediaDto>> {
    const response = await apiClient.get<ApiResponse<MediaDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update media metadata
   */
  async updateMedia(id: string, updateData: UpdateMediaDto): Promise<ApiResponse<MediaDto>> {
    const response = await apiClient.put<ApiResponse<MediaDto>>(`${this.baseUrl}/${id}`, updateData);
    return response.data;
  }

  /**
   * Delete media file
   */
  async deleteMedia(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Delete multiple media files
   */
  async deleteMultipleMedia(ids: string[]): Promise<ApiResponse<{ deletedCount: number; errors: string[] }>> {
    const response = await apiClient.post<ApiResponse<{ deletedCount: number; errors: string[] }>>(`${this.baseUrl}/bulk-delete`, { ids });
    return response.data;
  }

  // =================================================================
  // MEDIA SHARING OPERATIONS
  // =================================================================

  /**
   * Create media share
   */
  async createMediaShare(shareData: CreateMediaShareDto): Promise<ApiResponse<MediaShareDto>> {
    const response = await apiClient.post<ApiResponse<MediaShareDto>>(`${this.baseUrl}/share`, shareData);
    return response.data;
  }

  /**
   * Get shared media list
   */
  async getSharedMedia(): Promise<ApiResponse<MediaShareDto[]>> {
    const response = await apiClient.get<ApiResponse<MediaShareDto[]>>(`${this.baseUrl}/shared`);
    return response.data;
  }

  /**
   * Get media shared by current tenant
   */
  async getMediaSharedByMe(): Promise<ApiResponse<MediaShareDto[]>> {
    const response = await apiClient.get<ApiResponse<MediaShareDto[]>>(`${this.baseUrl}/shared/by-me`);
    return response.data;
  }

  /**
   * Revoke media share
   */
  async revokeMediaShare(shareId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.baseUrl}/share/${shareId}`);
    return response.data;
  }

  // =================================================================
  // MEDIA USAGE TRACKING
  // =================================================================

  /**
   * Increment media usage count
   */
  async incrementUsage(mediaId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.baseUrl}/${mediaId}/usage/increment`);
    return response.data;
  }

  /**
   * Decrement media usage count
   */
  async decrementUsage(mediaId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.baseUrl}/${mediaId}/usage/decrement`);
    return response.data;
  }

  /**
   * Track media usage in post content
   */
  async trackMediaInPost(postId: string, mediaIds: string[]): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.baseUrl}/track-usage`, {
      postId,
      mediaIds,
      action: 'increment'
    });
    return response.data;
  }

  /**
   * Remove media tracking from post
   */
  async untrackMediaInPost(postId: string, mediaIds: string[]): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.baseUrl}/track-usage`, {
      postId,
      mediaIds,
      action: 'decrement'
    });
    return response.data;
  }

  // =================================================================
  // MEDIA ANALYTICS & REPORTING
  // =================================================================

  /**
   * Get media analytics dashboard data
   */
  async getAnalytics(): Promise<ApiResponse<MediaAnalyticsDto>> {
    const response = await apiClient.get<ApiResponse<MediaAnalyticsDto>>(`${this.baseUrl}/analytics`);
    return response.data;
  }

  /**
   * Get unused media files (candidates for cleanup)
   */
  async getUnusedMedia(olderThanDays?: number): Promise<ApiResponse<MediaDto[]>> {
    const params = olderThanDays ? `?olderThanDays=${olderThanDays}` : '';
    const response = await apiClient.get<ApiResponse<MediaDto[]>>(`${this.baseUrl}/unused${params}`);
    return response.data;
  }

  /**
   * Get most used media files
   */
  async getMostUsedMedia(limit?: number): Promise<ApiResponse<MediaDto[]>> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<ApiResponse<MediaDto[]>>(`${this.baseUrl}/most-used${params}`);
    return response.data;
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  /**
   * Extract media IDs from HTML content
   */
  extractMediaIdsFromHtml(htmlContent: string): string[] {
    const mediaIds: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']*\/media\/([^/"']+)[^"']*)["'][^>]*>/gi;
    
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const mediaId = match[2];
      if (mediaId && !mediaIds.includes(mediaId)) {
        mediaIds.push(mediaId);
      }
    }
    
    return mediaIds;
  }

  /**
   * Extract all image URLs from HTML content
   */
  extractImageUrlsFromHtml(htmlContent: string): string[] {
    const urls: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']*)["'][^>]*>/gi;
    
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
    
    return urls;
  }

  /**
   * Validate file type for upload
   */
  validateFileType(file: File, allowedTypes: string[] = ['image/*', 'video/*']): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSize: number = 10 * 1024 * 1024): boolean { // 10MB default
    return file.size <= maxSize;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get media type from MIME type
   */
  getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || 
        mimeType.includes('document') || 
        mimeType.includes('text') ||
        mimeType.includes('spreadsheet') ||
        mimeType.includes('presentation')) return 'document';
    return 'other';
  }

  // =================================================================
  // CKEDITOR INTEGRATION
  // =================================================================

  /**
   * Create CKEditor upload adapter
   */
  createCKEditorUploadAdapter(loader: any, token: string) {
    return {
      upload: () => {
        return loader.file.then((file: File) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('alt', 'CKEditor uploaded image');
          formData.append('title', file.name);

          return fetch('/media/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          .then(response => response.json())
          .then((result: ApiResponse<MediaDto>) => {
            if (result.success && result.data) {
              // Return format CKEditor expects
              return {
                default: result.data.url,     // Main image URL
                '800': result.data.variants?.find(v => v.size === 'large')?.url,
                '500': result.data.variants?.find(v => v.size === 'medium')?.url,
                '150': result.data.variants?.find(v => v.size === 'thumbnail')?.url
              };
            }
            throw new Error(result.message || 'Upload failed');
          });
        });
      }
    };
  }

  /**
   * Get CKEditor configuration with media upload
   */
  getCKEditorConfig(token: string) {
    return {
      toolbar: [
        'heading', '|',
        'bold', 'italic', 'link', '|',
        'imageUpload', 'mediaEmbed', '|',  // Image upload button
        'bulletedList', 'numberedList', '|',
        'outdent', 'indent', '|',
        'undo', 'redo'
      ],
      image: {
        toolbar: [
          'imageTextAlternative',
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          'linkImage'
        ]
      },
      simpleUpload: {
        uploadUrl: '/media/upload',      // Upload endpoint
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    };
  }
}

// Create singleton instance
export const mediaService = new MediaService();
