import { apiClient } from './api';

// Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  type: string;
  excerpt: string;
  body: string;
  content?: string; // alias for body
  status: string;
  authorId: string;
  authorName: string;
  destinationId: string;
  destinationName: string;
  publishAt: string;
  seoMeta: string;
  createdAt: string;
  updatedAt: string;
  schemaMarkup: string;
  canonicalUrl: string;
  metaRobots: string;
  structuredData: string;
  featuredImageId: string;
  featuredImageUrl: string;
  featuredImage?: FeaturedImage;
  commentCount: number;
  averageRating: number;
  tags: Tag[];
  categories: Category[];
}

export interface FeaturedImage {
  id: string;
  url: string;
  alt: string;
  meta: {
    title: string;
    description: string;
    caption: string;
    custom: Record<string, string>;
  };
  createdAt: string;
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  variants: Array<{
    size: string;
    url: string;
    dimensions: {
      width: number;
      height: number;
      aspectRatio: number;
    };
    fileSize: number;
  }>;
  seoData: {
    alt: string;
    title: string;
    caption: string;
    description: string;
    keywords: string[];
  };
  usageCount: number;
  updatedAt: string;
}

export interface Tag {
  id: string;
  type: string;
  name: string;
  slug: string;
  parentId: string;
  parentName: string;
  postCount: number;
  children: string[];
}

export interface Category {
  id: string;
  type: string;
  name: string;
  slug: string;
  parentId: string;
  parentName: string;
  postCount: number;
  children: string[];
}

export interface Media {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  created_at: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'category' | 'tag';
  parent_id?: string;
  count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parent_id?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  errors?: string[];
  timestamp: string;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Posts API
export const postsApi = {
  getAll: async (params?: { 
    pageNumber?: number; 
    pageSize?: number; 
    status?: string; 
    type?: string;
    search?: string;
  }) => {
    const queryParams = {
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 10,
      ...(params?.status && { status: params.status }),
      ...(params?.type && { type: params.type }),
      ...(params?.search && { search: params.search })
    };
    
    const response = await apiClient.get<PaginatedResponse<Post>>('/Posts', { 
      params: queryParams 
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Post>>(`/Posts/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Post>) => {
    const response = await apiClient.post<ApiResponse<Post>>('/Posts', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Post>) => {
    const response = await apiClient.put<ApiResponse<Post>>(`/Posts/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/Posts/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<ApiResponse<Post>>(`/Posts/${id}/status`, { status });
    return response.data.data;
  }
};

// Media API
export const mediaApi = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    mime_type?: string;
    search?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Media>>('/media', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Media>>(`/media/${id}`);
    return response.data.data;
  },

  upload: async (file: File, altText?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    
    const response = await apiClient.post<ApiResponse<Media>>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  update: async (id: string, data: Partial<Media>) => {
    const response = await apiClient.put<ApiResponse<Media>>(`/media/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/media/${id}`);
    return response.data;
  }
};

// Taxonomies API
export const taxonomiesApi = {
  getAll: async (type: 'category' | 'tag', params?: { 
    page?: number; 
    limit?: number;
    search?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Taxonomy>>(`/taxonomies/${type}`, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Taxonomy>>(`/taxonomies/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Taxonomy>) => {
    const response = await apiClient.post<ApiResponse<Taxonomy>>('/taxonomies', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Taxonomy>) => {
    const response = await apiClient.put<ApiResponse<Taxonomy>>(`/taxonomies/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/taxonomies/${id}`);
    return response.data;
  }
};

// Comments API
export const commentsApi = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    post_id?: string;
    search?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Comment>>('/comments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Comment>>(`/comments/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Comment>) => {
    const response = await apiClient.post<ApiResponse<Comment>>('/comments', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Comment>) => {
    const response = await apiClient.put<ApiResponse<Comment>>(`/comments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/comments/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<ApiResponse<Comment>>(`/comments/${id}/status`, { status });
    return response.data.data;
  }
};
