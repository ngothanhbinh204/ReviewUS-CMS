import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { postService } from '../../services/postService';
import { Save, Rocket, FileEdit, Image } from "lucide-react";
import ContentEditor from '../common/ContentEditor';
import { FeaturedImagePicker } from '../common/FeaturedImagePicker';
import { KeywordInput } from '../common/KeywordInput';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { MediaDto } from '../../types/media.types';
import { tenantService, Tenant } from '../../services/tenantService';
import { destinationService } from '../../services/destinationService';
import { DestinationListDto } from '../../types/destination.types';

import { CreatePostDto, UpdatePostDto, SeoMetaDto } from '../../types/post.types';

const PostForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [post, setPost] = useState<CreatePostDto>({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    status: 'draft',
    publishAt: '',
    destinationId: '',
    featuredImageId: '',
    canonicalUrl: '',
    metaRobots: 'index,follow',
    taxonomyIds: [],
    mediaIds: [],
    seoMeta: {
      title: '',
      description: '',
      keywords: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [showFeaturedImagePicker, setShowFeaturedImagePicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<MediaDto | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [destinations, setDestinations] = useState<DestinationListDto[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load current user
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          // Check if user is admin (super_admin role or similar)
          const isUserAdmin = user.roles.includes("super_admin") || user.roles.includes("Admin");
          setIsAdmin(isUserAdmin);
          
          // If admin, load available tenants
          if (isUserAdmin) {
            try {
              const availableTenants = await tenantService.getAvailableTenants();
              setTenants(availableTenants);

              // Set current tenant as selected
              const currentTenantId = tenantService.getCurrentTenantId();
              if (currentTenantId) {
                setSelectedTenantId(currentTenantId);
              }
            } catch (error) {
              console.error('Failed to load tenants:', error);
            }
          } 
        }
        
        // Load destinations
        try {
          const destinationsResponse = await destinationService.getDestinations();
          if (destinationsResponse.data) {
            setDestinations(destinationsResponse.data);
          }
        } catch (error) {
          console.error('Failed to load destinations:', error);
        }
        
        // Load post data if editing - always force refresh to avoid cache issues
        if (isEdit && id) {
          console.log('Edit mode detected, force refreshing post data for ID:', id);
          await fetchPost(id);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [id, isEdit]);

  // Additional effect to handle navigation changes and force refresh
  useEffect(() => {
    if (isEdit && id) {
      console.log('Post ID changed, refreshing data for:', id);
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching post with ID:', postId);
      
      // Force fresh data to avoid cache issues
      const response = await postService.getPost(postId, { forceRefresh: true });
      console.log('API Response:', response);
      
      const postData = response.data;
      console.log('Post data:', postData);
      
      if (postData) {
        // Parse SEO Meta data if it's a JSON string
        let parsedSeoMeta = {
          title: '',
          description: '',
          keywords: []
        };

        if (postData.seoMeta) {
          try {
            // If seoMeta is a string, parse it
            if (typeof postData.seoMeta === 'string') {
              // Handle double-escaped JSON string
              let cleanJsonString: string = postData.seoMeta;
              
              // Remove outer quotes and unescape
              if (cleanJsonString.startsWith('"') && cleanJsonString.endsWith('"')) {
                cleanJsonString = cleanJsonString.slice(1, -1);
              }
              
              // Replace escaped quotes
              cleanJsonString = cleanJsonString.replace(/\\"/g, '"');
              
              console.log('Cleaned JSON string:', cleanJsonString);
              const parsed = JSON.parse(cleanJsonString);
              
              parsedSeoMeta = {
                title: parsed.title || '',
                description: parsed.description || '',
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : 
                         (typeof parsed.keywords === 'string' ? parsed.keywords.split(',').map((k: string) => k.trim()) : [])
              };
            } else if (typeof postData.seoMeta === 'object' && postData.seoMeta !== null) {
              // If it's already an object, use it directly
              parsedSeoMeta = {
                title: (postData.seoMeta as any).title || '',
                description: (postData.seoMeta as any).description || '',
                keywords: Array.isArray((postData.seoMeta as any).keywords) ? (postData.seoMeta as any).keywords : []
              };
            }
          } catch (parseError) {
            console.error('Error parsing SEO meta:', parseError);
            console.log('Raw seoMeta:', postData.seoMeta);
          }
        }

        const newPostState = {
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || '',
          body: postData.body || '', // Keep HTML as is for CKEditor
          status: postData.status,
          publishAt: postData.publishAt && postData.publishAt !== '' 
            ? new Date(postData.publishAt).toISOString() 
            : '',
          destinationId: postData.destinationId || '',
          featuredImageId: postData.featuredImageId || '',
          canonicalUrl: postData.canonicalUrl || '',
          metaRobots: postData.metaRobots,
          taxonomyIds: postData.taxonomies?.map((t: any) => t.id) || [],
          mediaIds: postData.media?.map((m: any) => m.id) || [],
          seoMeta: parsedSeoMeta
        };
        
        console.log('Setting post state:', newPostState);
        console.log('Post body content:', postData.body);
        console.log('Post body length:', (postData.body || '').length);
        setPost(newPostState);
        
        // Force editor re-render to load new content
      } else {
        console.error('No post data received');
        setError('Post not found');
      }
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePostDto, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && value) {
      const slug = postService.generateSlug(value);
      setPost(prev => ({ ...prev, slug }));
    }
  };

  const handleSeoChange = (field: keyof SeoMetaDto, value: any) => {
    setPost(prev => ({
      ...prev,
      seoMeta: {
        ...prev.seoMeta!,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const errors = postService.validatePost(post);
    
    // Add admin tenant validation
    if (isAdmin && !selectedTenantId) {
      errors.push('Please select a target tenant for this post');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async (status?: string) => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // If admin selected a different tenant, switch context temporarily
      let originalTenant = null;
      if (isAdmin && selectedTenantId && selectedTenantId !== tenantService.getCurrentTenantId()) {
        originalTenant = tenantService.getCurrentTenant();
        await tenantService.selectTenant(selectedTenantId);
      }

      const postData = { ...post };
      if (status) {
        postData.status = status;
      }

      // Handle publishAt - convert empty string to null for API
      if (postData.publishAt === '' || !postData.publishAt) {
        postData.publishAt = undefined; // Remove the field entirely if empty
      } else {
        // Ensure the date is in correct ISO format
        try {
          const date = new Date(postData.publishAt);
          if (isNaN(date.getTime())) {
            // Invalid date, remove the field
            postData.publishAt = undefined;
          } else {
            // Convert to ISO string
            postData.publishAt = date.toISOString();
          }
        } catch (error) {
          console.error('Invalid publishAt date:', postData.publishAt);
          postData.publishAt = undefined;
        }
      }

      // Handle destinationId - convert empty string to null for API
      if (postData.destinationId === '' || !postData.destinationId) {
        postData.destinationId = undefined; // Remove the field entirely if empty
      }

      console.log('Post data being sent:', postData); // Debug log

      // Convert seoMeta object to JSON string format for API
      if (postData.seoMeta) {
        const seoMetaJson = {
          title: postData.seoMeta.title || '',
          description: postData.seoMeta.description || '',
          keywords: Array.isArray(postData.seoMeta.keywords) ? 
            postData.seoMeta.keywords.join(', ') : 
            (postData.seoMeta.keywords || '')
        };
        
        // Convert to JSON string format that matches your database structure
        (postData as any).seoMeta = JSON.stringify(seoMetaJson);
        console.log('SEO Meta being sent:', (postData as any).seoMeta);
      }

      if (isEdit && id) {
        await postService.updatePost(id, { id, ...postData } as UpdatePostDto);
      } else {
        await postService.createPost(postData);
      }
      
      // Restore original tenant context if we switched
      if (originalTenant && originalTenant.id !== selectedTenantId) {
        await tenantService.selectTenant(originalTenant.id);
      }

      navigate('/posts');
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  const handleDraft = () => {
    handleSave('draft');
  };

  const handleInsertImage = (imageUrl: string, alt?: string) => {
    // imageUrl is now already the full GCS URL from the API response
    const imageHtml = `\n<figure class="image">
  <img 
    src="${imageUrl}" 
    alt="${alt || 'Image'}" 
    style="max-width: 100%; height: auto;" 
    loading="lazy"
  />
  <figcaption>${alt || 'Image caption'}</figcaption>
</figure>\n`;
    
    handleInputChange('body', post.body + imageHtml);
    setShowMediaPicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update your existing post' : 'Write and publish your new content'}
          </p>
          {/* Debug Info for Edit Mode */}
          {isEdit && id && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
              <div className="text-blue-700 dark:text-blue-300">
                Debug: Editing post ID: {id} | Current title: "{post.title}" | Loading: {loading ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/posts')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleDraft}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'content'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'seo'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  SEO
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={post.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                      placeholder="Enter post title..."
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="post-url-slug"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={post.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of the post..."
                    />
                  </div>
                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                        <ContentEditor
                          key={`editor-${id || 'new'}-${post.body?.length || 0}`}
                          value={post.body || ''}
                          onChange={(value: string) => handleInputChange('body', value)}
                          placeholder="Write your post content here..."
                        />

                    </div>

                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  {/* Debug SEO Meta */}
                  {post.seoMeta && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <details>
                        <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Debug: SEO Meta Data
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(post.seoMeta, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={post.seoMeta?.title || ''}
                      onChange={(e) => handleSeoChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="SEO title for search engines..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={post.seoMeta?.description || ''}
                      onChange={(e) => handleSeoChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Meta description for search results (160 characters recommended)..."
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {(post.seoMeta?.description || '').length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Focus Keywords
                    </label>
                    <KeywordInput
                      keywords={Array.isArray(post.seoMeta?.keywords) ? post.seoMeta.keywords : []}
                      onChange={(keywords) => handleSeoChange('keywords', keywords)}
                      placeholder="Enter focus keywords and press Enter or Space to add them"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter keywords one by one and press Enter, Space, or comma to add them. Use keywords that best describe your content.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={post.canonicalUrl}
                      onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>




                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Admin Tenant Selection */}
                  {isAdmin && tenants.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                        Admin Settings
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target Tenant <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedTenantId}
                          onChange={(e) => setSelectedTenantId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="">Select a tenant...</option>
                          {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name || tenant.slug || tenant.domain}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          As an admin, you can create posts for any tenant. Select the tenant where this post should be published.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destination
                    </label>
                    <select
                      value={post.destinationId}
                      onChange={(e) => handleInputChange('destinationId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a destination...</option>
                      {destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name} ({[destination.city, destination.country].filter(Boolean).join(', ') || 'No location'})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Select where this post should be published
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={post.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  {post.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Publish Date
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          post.publishAt && post.publishAt !== '' 
                            ? new Date(post.publishAt).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) => handleInputChange('publishAt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min={new Date().toISOString().slice(0, 16)} // Prevent scheduling in the past
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select when this post should be published
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Robots
                    </label>
                    <select
                      value={post.metaRobots}
                      onChange={(e) => handleInputChange('metaRobots', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="index,follow">Index, Follow</option>
                      <option value="index,nofollow">Index, No Follow</option>
                      <option value="noindex,follow">No Index, Follow</option>
                      <option value="noindex,nofollow">No Index, No Follow</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={handleDraft}
              disabled={saving}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} /> Save as Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded disabled:opacity-50 flex items-center gap-2"
            >
              <Rocket size={16} /> Publish Now
            </button>
            {isEdit && (
              <button
                onClick={() => navigate(`/posts/${id}/revisions`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <FileEdit size={16} /> View Revisions
              </button>
            )}
          </div>
          </div>

          {/* SEO Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">SEO Score</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-500">Good SEO Score</div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-600 dark:text-gray-400">Title optimized</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-600 dark:text-gray-400">Meta description set</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-gray-600 dark:text-gray-400">Add focus keywords</span>
              </div>
            </div>
          </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
             {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Featured Image
                    </label>
                    <div className="flex flex-col items-center gap-4">
                      {featuredImage ? (
                        <div className="relative">
                          <img 
                            src={featuredImage.url} 
                            alt={featuredImage.alt || "Featured"} 
                            className="w-auto h-30 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFeaturedImage(null);
                              handleInputChange('featuredImageId', '');
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center">
                          <Image size={40} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowFeaturedImagePicker(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {featuredImage ? 'Change Image' : 'Choose Image'}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Select a featured image from your media library or upload a new one
                        </p>
                      </div>
                    </div>  
                  </div>
          </div>
        </div>
      </div>
      
      {/* Featured Image Picker Modal */}
      <FeaturedImagePicker
        isOpen={showFeaturedImagePicker}
        onClose={() => setShowFeaturedImagePicker(false)}
        onSelect={(media) => {
          setFeaturedImage(media);
          setPost(prev => ({ ...prev, featuredImageId: media.id }));
          setShowFeaturedImagePicker(false);
        }}
        selectedMediaId={post.featuredImageId}
      />

      {/* Media Picker Modal for Content */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(media) => {
          if (Array.isArray(media)) {
            // Handle multiple selection
            media.forEach(item => handleInsertImage(item.url, item.alt || ''));
          } else {
            // Handle single selection
            handleInsertImage(media.url, media.alt || '');
          }
          setShowMediaPicker(false);
        }}
      />
    </div>
  );
};

export default PostForm;
