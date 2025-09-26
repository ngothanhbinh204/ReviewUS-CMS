import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { postService } from '../../services/postService';
import { Save, Rocket, FileEdit, Image } from "lucide-react";
import HTMLEditor from '../common/HTMLEditor';
import ImageManager from '../media/ImageManager';

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
      keywords: [],
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [showImageManager, setShowImageManager] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchPost(id);
    }
  }, [id, isEdit]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching post with ID:', postId);
      
      const response = await postService.getPost(postId);
      console.log('API Response:', response);
      
      const postData = response.data;
      console.log('Post data:', postData);
      
      if (postData) {
        // Parse SEO Meta data if it's a JSON string
        let parsedSeoMeta = {
          title: '',
          description: '',
          keywords: [],
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          twitterTitle: '',
          twitterDescription: '',
          twitterImage: ''
        };

        if (postData.seoMeta) {
          try {
            // If seoMeta is a string, parse it
            if (typeof postData.seoMeta === 'string') {
              // Handle double-escaped JSON string
              let cleanJsonString = postData.seoMeta;
              
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
                         (typeof parsed.keywords === 'string' ? parsed.keywords.split(',').map((k: string) => k.trim()) : []),
                ogTitle: parsed.ogTitle || '',
                ogDescription: parsed.ogDescription || '',
                ogImage: parsed.ogImage || '',
                twitterTitle: parsed.twitterTitle || '',
                twitterDescription: parsed.twitterDescription || '',
                twitterImage: parsed.twitterImage || ''
              };
            } else if (typeof postData.seoMeta === 'object') {
              // If it's already an object, use it directly
              parsedSeoMeta = {
                title: postData.seoMeta.title || '',
                description: postData.seoMeta.description || '',
                keywords: Array.isArray(postData.seoMeta.keywords) ? postData.seoMeta.keywords : 
                         (typeof postData.seoMeta.keywords === 'string' ? postData.seoMeta.keywords.split(',').map((k: string) => k.trim()) : []),
                ogTitle: postData.seoMeta.ogTitle || '',
                ogDescription: postData.seoMeta.ogDescription || '',
                ogImage: postData.seoMeta.ogImage || '',
                twitterTitle: postData.seoMeta.twitterTitle || '',
                twitterDescription: postData.seoMeta.twitterDescription || '',
                twitterImage: postData.seoMeta.twitterImage || ''
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
          publishAt: postData.publishAt || '',
          destinationId: postData.destinationId || '',
          featuredImageId: postData.featuredImageId || '',
          canonicalUrl: postData.canonicalUrl || '',
          metaRobots: postData.metaRobots,
          taxonomyIds: postData.taxonomies?.map((t: any) => t.id) || [],
          mediaIds: postData.media?.map((m: any) => m.id) || [],
          seoMeta: parsedSeoMeta
        };
        
        console.log('Setting post state:', newPostState);
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
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async (status?: string) => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const postData = { ...post };
      if (status) {
        postData.status = status;
      }

      // Convert seoMeta object to JSON string format for API
      if (postData.seoMeta) {
        const seoMetaJson = {
          title: postData.seoMeta.title || '',
          description: postData.seoMeta.description || '',
          keywords: Array.isArray(postData.seoMeta.keywords) ? 
            postData.seoMeta.keywords.join(', ') : 
            (postData.seoMeta.keywords || ''),
          ogTitle: postData.seoMeta.ogTitle || '',
          ogDescription: postData.seoMeta.ogDescription || '',
          ogImage: postData.seoMeta.ogImage || '',
          twitterTitle: postData.seoMeta.twitterTitle || '',
          twitterDescription: postData.seoMeta.twitterDescription || '',
          twitterImage: postData.seoMeta.twitterImage || ''
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
    setShowImageManager(false);
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

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Featured Image
                    </label>
                    <div className="flex items-center gap-4">
                      {post.featuredImageId ? (
                        <div className="relative">
                          <img 
                            src={`/api/v1/media/${post.featuredImageId}`} 
                            alt="Featured" 
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleInputChange('featuredImageId', '')}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                // Upload featured image logic here
                                const formData = new FormData();
                                formData.append('file', file);
                                
                                // Call your media upload API
                                const response = await fetch('/api/v1/media/upload', {
                                  method: 'POST',
                                  body: formData,
                                });
                                
                                if (response.ok) {
                                  const result = await response.json();
                                  handleInputChange('featuredImageId', result.data?.id || result.id);
                                } else {
                                  console.error('Upload failed');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                              }
                            }
                          }}
                          className="hidden"
                          id="featuredImageInput"
                        />
                        <label
                          htmlFor="featuredImageInput"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer inline-block"
                        >
                          Choose Image
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Upload a featured image for your post
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    
                    {/* Toggle between editor modes */}
                    <div className="mb-2">
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => setEditorMode('visual')}
                          className={`px-3 py-1 text-sm rounded ${
                            editorMode === 'visual' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Visual Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode('html')}
                          className={`px-3 py-1 text-sm rounded ${
                            editorMode === 'html' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          HTML Source
                        </button>
                        
                        {/* Image Manager Button */}
                        <div className="ml-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowImageManager(true)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Image size={14} />
                            Insert Image
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      {/* Debug information */}
                      {post.body && (
                        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 text-xs">
                          <details>
                            <summary>Debug: Raw HTML content</summary>
                            <pre className="mt-2 whitespace-pre-wrap text-xs">
                              {post.body}
                            </pre>
                          </details>
                        </div>
                      )}

                      {/* HTML Source Mode */}
                      {editorMode === 'html' ? (
                        <textarea
                          value={post.body || ''}
                          onChange={(e) => handleInputChange('body', e.target.value)}
                          className="w-full h-96 p-4 font-mono text-sm border-none resize-none focus:outline-none dark:bg-gray-800 dark:text-white"
                          placeholder="Enter HTML content here..."
                        />
                      ) : (
                        /* Visual Editor Mode */
                        <HTMLEditor
                          value={post.body || ''}
                          onChange={(value) => handleInputChange('body', value)}
                        />
                      )}
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
                    <input
                      type="text"
                      value={Array.isArray(post.seoMeta?.keywords) 
                        ? post.seoMeta.keywords.join(', ') 
                        : (post.seoMeta?.keywords || '')
                      }
                      onChange={(e) => {
                        const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                        handleSeoChange('keywords', keywords);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="keyword1, keyword2, keyword3..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Keywords type: {Array.isArray(post.seoMeta?.keywords) ? 'Array' : typeof post.seoMeta?.keywords}
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

                  {/* Open Graph */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Open Graph (Facebook)</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          OG Title
                        </label>
                        <input
                          type="text"
                          value={post.seoMeta?.ogTitle || ''}
                          onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Facebook share title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          OG Description
                        </label>
                        <textarea
                          value={post.seoMeta?.ogDescription || ''}
                          onChange={(e) => handleSeoChange('ogDescription', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Facebook share description..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Twitter Cards</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter Title
                        </label>
                        <input
                          type="text"
                          value={post.seoMeta?.twitterTitle || ''}
                          onChange={(e) => handleSeoChange('twitterTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Twitter share title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter Description
                        </label>
                        <textarea
                          value={post.seoMeta?.twitterDescription || ''}
                          onChange={(e) => handleSeoChange('twitterDescription', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Twitter share description..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
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
                        value={post.publishAt}
                        onChange={(e) => handleInputChange('publishAt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
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
        </div>
      </div>
      
      {/* Image Manager Modal */}
      <ImageManager
        isOpen={showImageManager}
        onClose={() => setShowImageManager(false)}
        onSelectImage={handleInsertImage}
      />
    </div>
  );
};

export default PostForm;
