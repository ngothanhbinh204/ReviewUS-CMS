import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { postService } from '../../services/postService';
import { CreatePostDto, UpdatePostDto, SeoMetaDto } from '../../types/post.types';
// @ts-ignore
import CKEditor5 from '../CKEditor/index';

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
        const newPostState = {
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || '',
          body: postData.body || '',
          status: postData.status,
          publishAt: postData.publishAt || '',
          destinationId: postData.destinationId || '',
          featuredImageId: postData.featuredImageId || '',
          canonicalUrl: postData.canonicalUrl || '',
          metaRobots: postData.metaRobots,
          taxonomyIds: postData.taxonomies?.map((t: any) => t.id) || [],
          mediaIds: postData.media?.map((m: any) => m.id) || [],
          seoMeta: postData.seoMeta || {
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
        };
        
        console.log('Setting post state:', newPostState);
        setPost(newPostState);
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
                          onChange={(e) => {
                            // Handle image upload here
                            console.log('Image upload:', e.target.files?.[0]);
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
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      <CKEditor5
                        value={post.body || ''}
                        onChange={(data: string) => handleInputChange('body', data)}
                        accessToken="your-access-token"
                        onUpload={(data: any) => {
                          console.log('Image uploaded:', data);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
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
                      value={post.seoMeta?.keywords?.join(', ') || ''}
                      onChange={(e) => handleSeoChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="keyword1, keyword2, keyword3..."
                    />
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
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded disabled:opacity-50"
              >
                💾 Save as Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded disabled:opacity-50"
              >
                🚀 Publish Now
              </button>
              {isEdit && (
                <button
                  onClick={() => navigate(`/v1/posts/${id}/revisions`)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                >
                  📝 View Revisions
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
    </div>
  );
};

export default PostForm;
