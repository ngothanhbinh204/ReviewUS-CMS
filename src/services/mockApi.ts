import {
  mockPosts,
  mockMedia,
  mockCategories,
  mockTags,
  mockComments,
  mockTenants,
  mockUser,
  createMockResponse,
  createMockSingleResponse,
} from './mockData';

// Flag để bật/tắt mock mode
// Set to false when connecting to real C# API server
export const USE_MOCK_API = false;

// Mock delay to simulate network requests
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthApi = {
  login: async (credentials: { email: string; password: string }) => {
    await mockDelay();
    if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
      const token = 'mock-jwt-token-12345';
      localStorage.setItem('token', token);
      return createMockSingleResponse({ user: mockUser, token });
    }
    throw new Error('Invalid credentials');
  },

  register: async (data: { email: string; password: string; name: string }) => {
    await mockDelay();
    const newUser = { ...mockUser, id: Date.now().toString(), ...data };
    return createMockSingleResponse({ user: newUser, token: 'mock-jwt-token' });
  },

  getCurrentUser: async () => {
    await mockDelay();
    return createMockSingleResponse(mockUser);
  },
};

// Mock Posts API
export const mockPostsApi = {
  getAll: async (params?: any) => {
    await mockDelay();
    let filteredPosts = [...mockPosts];
    
    if (params?.status) {
      filteredPosts = filteredPosts.filter(post => post.status === params.status);
    }
    
    if (params?.type) {
      filteredPosts = filteredPosts.filter(post => post.type === params.type);
    }
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }
    
    return createMockResponse(filteredPosts, filteredPosts.length);
  },

  getById: async (id: string) => {
    await mockDelay();
    const post = mockPosts.find(p => p.id === id);
    if (!post) throw new Error('Post not found');
    return createMockSingleResponse(post);
  },

  create: async (data: any) => {
    await mockDelay();
    const newPost = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: mockUser.id,
    };
    mockPosts.unshift(newPost);
    return createMockSingleResponse(newPost);
  },

  update: async (id: string, data: any) => {
    await mockDelay();
    const index = mockPosts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    
    mockPosts[index] = {
      ...mockPosts[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return createMockSingleResponse(mockPosts[index]);
  },

  delete: async (id: string) => {
    await mockDelay();
    const index = mockPosts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    
    mockPosts.splice(index, 1);
    return createMockSingleResponse({ message: 'Post deleted successfully' });
  },

  updateStatus: async (id: string, status: string) => {
    await mockDelay();
    const index = mockPosts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    
    mockPosts[index].status = status as any;
    mockPosts[index].updated_at = new Date().toISOString();
    return createMockSingleResponse(mockPosts[index]);
  },
};

// Mock Media API
export const mockMediaApi = {
  getAll: async (params?: any) => {
    await mockDelay();
    let filteredMedia = [...mockMedia];
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredMedia = filteredMedia.filter(media => 
        media.filename.toLowerCase().includes(searchLower) ||
        (media.alt_text && media.alt_text.toLowerCase().includes(searchLower))
      );
    }
    
    return createMockResponse(filteredMedia, filteredMedia.length);
  },

  getById: async (id: string) => {
    await mockDelay();
    const media = mockMedia.find(m => m.id === id);
    if (!media) throw new Error('Media not found');
    return createMockSingleResponse(media);
  },

  upload: async (file: File, metadata?: any) => {
    await mockDelay(1000); // Simulate upload delay
    const newMedia = {
      id: Date.now().toString(),
      filename: file.name,
      original_filename: file.name,
      url: URL.createObjectURL(file),
      thumbnail_url: URL.createObjectURL(file),
      file_size: file.size,
      mime_type: file.type,
      width: 800,
      height: 600,
      alt_text: metadata?.alt_text || '',
      title: metadata?.title || file.name,
      caption: metadata?.caption || '',
      description: metadata?.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockMedia.unshift(newMedia);
    return createMockSingleResponse(newMedia);
  },

  update: async (id: string, data: any) => {
    await mockDelay();
    const index = mockMedia.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Media not found');
    
    mockMedia[index] = {
      ...mockMedia[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return createMockSingleResponse(mockMedia[index]);
  },

  delete: async (id: string) => {
    await mockDelay();
    const index = mockMedia.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Media not found');
    
    mockMedia.splice(index, 1);
    return createMockSingleResponse({ message: 'Media deleted successfully' });
  },
};

// Mock Taxonomies API
export const mockTaxonomiesApi = {
  getAll: async (params?: any) => {
    await mockDelay();
    const data = params?.type === 'tag' ? mockTags : mockCategories;
    let filtered = [...data];
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.slug.toLowerCase().includes(searchLower)
      );
    }
    
    return createMockResponse(filtered, filtered.length);
  },

  getById: async (id: string) => {
    await mockDelay();
    const item = [...mockCategories, ...mockTags].find(t => t.id === id);
    if (!item) throw new Error('Taxonomy not found');
    return createMockSingleResponse(item);
  },

  create: async (data: any) => {
    await mockDelay();
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      posts_count: 0,
    };
    
    if (data.type === 'tag') {
      mockTags.unshift(newItem);
    } else {
      mockCategories.unshift(newItem);
    }
    
    return createMockSingleResponse(newItem);
  },

  update: async (id: string, data: any) => {
    await mockDelay();
    const collections = [mockCategories, mockTags];
    
    for (let collection of collections) {
      const index = collection.findIndex(t => t.id === id);
      if (index !== -1) {
        collection[index] = { ...collection[index], ...data };
        return createMockSingleResponse(collection[index]);
      }
    }
    
    throw new Error('Taxonomy not found');
  },

  delete: async (id: string) => {
    await mockDelay();
    const collections = [mockCategories, mockTags];
    
    for (let collection of collections) {
      const index = collection.findIndex(t => t.id === id);
      if (index !== -1) {
        collection.splice(index, 1);
        return createMockSingleResponse({ message: 'Taxonomy deleted successfully' });
      }
    }
    
    throw new Error('Taxonomy not found');
  },
};

// Mock Comments API
export const mockCommentsApi = {
  getAll: async (params?: any) => {
    await mockDelay();
    let filtered = [...mockComments];
    
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(comment => comment.status === params.status);
    }
    
    if (params?.post_id) {
      filtered = filtered.filter(comment => comment.post_id === params.post_id);
    }
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(comment => 
        comment.content.toLowerCase().includes(searchLower) ||
        comment.author_name.toLowerCase().includes(searchLower)
      );
    }
    
    return createMockResponse(filtered, filtered.length);
  },

  getById: async (id: string) => {
    await mockDelay();
    const comment = mockComments.find(c => c.id === id);
    if (!comment) throw new Error('Comment not found');
    return createMockSingleResponse(comment);
  },

  update: async (id: string, data: any) => {
    await mockDelay();
    const index = mockComments.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Comment not found');
    
    mockComments[index] = {
      ...mockComments[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return createMockSingleResponse(mockComments[index]);
  },

  delete: async (id: string) => {
    await mockDelay();
    const index = mockComments.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Comment not found');
    
    mockComments.splice(index, 1);
    return createMockSingleResponse({ message: 'Comment deleted successfully' });
  },

  updateStatus: async (id: string, status: string) => {
    await mockDelay();
    const index = mockComments.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Comment not found');
    
    mockComments[index].status = status as any;
    mockComments[index].updated_at = new Date().toISOString();
    return createMockSingleResponse(mockComments[index]);
  },

  bulkUpdate: async (ids: string[], data: any) => {
    await mockDelay();
    ids.forEach(id => {
      const index = mockComments.findIndex(c => c.id === id);
      if (index !== -1) {
        mockComments[index] = {
          ...mockComments[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
      }
    });
    return createMockSingleResponse({ message: 'Comments updated successfully' });
  },
};

// Mock Tenants API
export const mockTenantsApi = {
  getAll: async (params?: any) => {
    await mockDelay();
    let filtered = [...mockTenants];
    
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === params.status);
    }
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(searchLower) ||
        tenant.domain.toLowerCase().includes(searchLower)
      );
    }
    
    return createMockResponse(filtered, filtered.length);
  },

  getById: async (id: string) => {
    await mockDelay();
    const tenant = mockTenants.find(t => t.id === id);
    if (!tenant) throw new Error('Tenant not found');
    return createMockSingleResponse(tenant);
  },

  create: async (data: any) => {
    await mockDelay();
    const newTenant = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users_count: 0,
      posts_count: 0,
    };
    mockTenants.unshift(newTenant);
    return createMockSingleResponse(newTenant);
  },

  update: async (id: string, data: any) => {
    await mockDelay();
    const index = mockTenants.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tenant not found');
    
    mockTenants[index] = {
      ...mockTenants[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return createMockSingleResponse(mockTenants[index]);
  },

  delete: async (id: string) => {
    await mockDelay();
    const index = mockTenants.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tenant not found');
    
    mockTenants.splice(index, 1);
    return createMockSingleResponse({ message: 'Tenant deleted successfully' });
  },
};
