import { apiClient } from './api';
import {
  PostDto,
  PostListDto,
  CreatePostDto,
  UpdatePostDto,
  PostQueryParams,
  PostRevisionDto,
  PostRevisionListDto,
  PostRevisionCompareDto,
  RevisionQueryParams,
  RevisionCompareParams,
  RevertPostDto,
  CreateManualRevisionDto,
  BulkRevisionResultDto,
  RevisionAnalyticsDto,
  RevisionPerformanceDto,
  PostPerformanceCompareDto,
  SeoComparisonDto,
  SeoImpactAnalysisDto,
  RevisionAuditDto
} from '../types/post.types';
import { ApiResponse, PagedApiResponse } from '../types/api.types';

class PostService {
  private baseUrl = '/v1/posts';

  // 📋 POST CRUD OPERATIONS
  async getPosts(params?: PostQueryParams): Promise<PagedApiResponse<PostListDto>> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  async getPost(id: string): Promise<ApiResponse<PostDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getPostBySlug(slug: string): Promise<ApiResponse<PostDto>> {
    const response = await apiClient.get(`${this.baseUrl}/slug/${slug}`);
    return response.data;
  }

  async createPost(data: CreatePostDto): Promise<ApiResponse<PostDto>> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updatePost(id: string, data: UpdatePostDto): Promise<ApiResponse<PostDto>> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deletePost(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async publishPost(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/publish`);
    return response.data;
  }

  async unpublishPost(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/unpublish`);
    return response.data;
  }

  async getRelatedPosts(id: string): Promise<ApiResponse<PostListDto[]>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/related`);
    return response.data;
  }

  // 🔄 REVISION OPERATIONS
  async getRevisions(postId: string, params?: RevisionQueryParams): Promise<PagedApiResponse<PostRevisionListDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions`, { params });
    return response.data;
  }

  async getRevision(postId: string, revisionId: number): Promise<ApiResponse<PostRevisionDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/${revisionId}`);
    return response.data;
  }

  async compareRevisions(postId: string, params: RevisionCompareParams): Promise<ApiResponse<PostRevisionCompareDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/compare`, { params });
    return response.data;
  }

  async revertToRevision(postId: string, revisionId: number, data?: RevertPostDto): Promise<ApiResponse<PostDto>> {
    const response = await apiClient.post(`${this.baseUrl}/${postId}/revisions/${revisionId}/revert`, data || {});
    return response.data;
  }

  async createManualRevision(postId: string, data: CreateManualRevisionDto): Promise<ApiResponse<PostRevisionDto>> {
    const response = await apiClient.post(`${this.baseUrl}/${postId}/revisions/create`, data);
    return response.data;
  }

  async deleteRevision(postId: string, revisionId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`${this.baseUrl}/${postId}/revisions/${revisionId}`);
    return response.data;
  }

  async cleanupRevisions(postId: string, keepCount?: number): Promise<ApiResponse<null>> {
    const response = await apiClient.post(`${this.baseUrl}/${postId}/revisions/cleanup`, null, {
      params: { keepCount }
    });
    return response.data;
  }

  async bulkDeleteRevisions(postId: string, revisionIds: number[]): Promise<ApiResponse<BulkRevisionResultDto>> {
    const response = await apiClient.post(`${this.baseUrl}/${postId}/revisions/bulk-delete`, { revisionIds });
    return response.data;
  }

  // 📊 PERFORMANCE & ANALYTICS
  async compareWithBestRevision(postId: string): Promise<ApiResponse<PostPerformanceCompareDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/performance/compare-with-best`);
    return response.data;
  }

  async compareWithSpecificRevision(postId: string, revisionId: number): Promise<ApiResponse<PostPerformanceCompareDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/performance/compare/${revisionId}`);
    return response.data;
  }

  async getPerformanceRanking(postId: string, topCount?: number): Promise<ApiResponse<RevisionPerformanceDto[]>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/performance/ranking`, {
      params: { topCount }
    });
    return response.data;
  }

  async getRevisionAnalytics(postId: string, fromDate?: string, toDate?: string): Promise<ApiResponse<RevisionAnalyticsDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/analytics`, {
      params: { fromDate, toDate }
    });
    return response.data;
  }

  async getRevisionAudit(postId: string, params?: RevisionQueryParams): Promise<PagedApiResponse<RevisionAuditDto[]>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/audit`, { params });
    return response.data;
  }

  // 🔍 SEO OPERATIONS
  async compareSeoMetrics(postId: string, fromId: number, toId: number): Promise<ApiResponse<SeoComparisonDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/seo/compare/${fromId}/${toId}`);
    return response.data;
  }

  async analyzeSeoImpact(postId: string, revisionId: number): Promise<ApiResponse<SeoImpactAnalysisDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${postId}/revisions/seo/analyze/${revisionId}`);
    return response.data;
  }

  async updateSitemap(postId: string, revisionId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.post(`${this.baseUrl}/${postId}/revisions/seo/update-sitemap/${revisionId}`);
    return response.data;
  }

  // 🛠️ UTILITY METHODS
  generateSlug(title: string): string {
  return title
    .normalize("NFD") // chuẩn hoá unicode, tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xoá dấu
    .replace(/đ/g, "d") // thay đ -> d
    .replace(/Đ/g, "D") // thay Đ -> D
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự đặc biệt
    .replace(/\s+/g, "-") // khoảng trắng -> -
    .replace(/-+/g, "-") // gộp nhiều dấu - thành 1
    .replace(/^-+|-+$/g, ""); // xoá - ở đầu/cuối
}


  validatePost(data: CreatePostDto | UpdatePostDto): string[] {
    const errors: string[] = [];
    
    if (!data.title?.trim()) {
      errors.push('Title is required');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (data.excerpt && data.excerpt.length > 500) {
      errors.push('Excerpt must be less than 500 characters');
    }
    
    if (data.seoMeta?.description && data.seoMeta.description.length > 160) {
      errors.push('Meta description should be less than 160 characters for optimal SEO');
    }
    
    return errors;
  }
}

export const postService = new PostService();
