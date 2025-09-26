import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import {
  USE_MOCK_API,
  mockAuthApi,
  mockPostsApi,
  mockMediaApi,
  mockTaxonomiesApi,
  mockCommentsApi,
  mockTenantsApi,
} from './mockApi';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token and tenant info
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant information to headers
    const tenantId = localStorage.getItem('current_tenant_id');
    const tenantSlug = localStorage.getItem('current_tenant_slug');
    
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
    }

    // Add cache busting headers if explicitly requested
    if (config.headers['X-Force-Refresh']) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      
      // Add timestamp to query params for cache busting
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
      // Note: Cannot set Host header from browser for security reasons
      // The backend should use X-Tenant-Slug instead
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);
    } else if (error.request) {
      console.error('Error Request:', error.request);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect immediately, let components handle it
      // window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = USE_MOCK_API ? mockAuthApi : {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', data),
    
  getCurrentUser: () =>
    apiClient.get('/auth/profile'),
    
  refresh: () =>
    apiClient.post('/auth/refresh'),
    
  logout: () => {
    // Get user data from localStorage to extract userId
    const userData = localStorage.getItem('user');
    let userId = null;
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userId = user.id || user.userId;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Send userId in request body
    return apiClient.post('/auth/logout', { userId });
  },
};

// Posts API
export const postsApi = USE_MOCK_API ? mockPostsApi : {
  getAll: (params?: { 
    pageNumber?: number; 
    pageSize?: number; 
    type?: 'post' | 'page';
    status?: 'draft' | 'pending' | 'published';
    search?: string;
  }) =>
    apiClient.get('/Posts', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/Posts/${id}`),
    
  create: (data: any) =>
    apiClient.post('/Posts', data),
    
  update: (id: string, data: any) =>
    apiClient.put(`/Posts/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/Posts/${id}`),
    
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/Posts/${id}/status`, { status }),
};

// Media API
export const mediaApi = USE_MOCK_API ? mockMediaApi : {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    type?: string;
    search?: string;
  }) =>
    apiClient.get('/media', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/media/${id}`),
    
  upload: (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
    
  update: (id: string, data: any) =>
    apiClient.put(`/media/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/media/${id}`),
};

// Taxonomies API
export const taxonomiesApi = USE_MOCK_API ? mockTaxonomiesApi : {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    type?: 'category' | 'tag';
    search?: string;
  }) =>
    apiClient.get('/taxonomies', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/taxonomies/${id}`),
    
  create: (data: any) =>
    apiClient.post('/taxonomies', data),
    
  update: (id: string, data: any) =>
    apiClient.put(`/taxonomies/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/taxonomies/${id}`),
};

// Comments API
export const commentsApi = USE_MOCK_API ? mockCommentsApi : {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    post_id?: string;
    search?: string;
  }) =>
    apiClient.get('/comments', { params }),
    
  getById: (id: string) =>
    apiClient.get(`/comments/${id}`),
    
  update: (id: string, data: any) =>
    apiClient.put(`/comments/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/comments/${id}`),
    
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/comments/${id}/status`, { status }),
    
  bulkUpdate: (ids: string[], data: any) =>
    apiClient.patch('/comments/bulk', { ids, ...data }),
};

// Tenants API (Admin only)
export const tenantsApi = USE_MOCK_API ? mockTenantsApi : {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get('Test/tenants', { params }),
    
  getById: (id: string) =>
    apiClient.get(`Test/tenants/${id}`),
    
  create: (data: any) =>
    apiClient.post('Test/tenants', data),
    
  update: (id: string, data: any) =>
    apiClient.put(`Test/tenants/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`Test/tenants/${id}`),
};

// Tenant Selector API
export const tenantSelectorApi = {
  getMyTenants: () =>
    apiClient.get('/TenantSelector/my-tenants'),
    
  selectTenant: (tenantId: string) =>
    apiClient.post('/TenantSelector/select-tenant', { tenantId }),
    
  getCurrentTenant: () =>
    apiClient.get('/TenantSelector/current-tenant'),
};

export default apiClient;
