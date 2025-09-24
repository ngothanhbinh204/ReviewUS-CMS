import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { postsApi, Post } from '../../services/cmsApi';
import TenantGuard from '../common/TenantGuard';
import toast from 'react-hot-toast';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: string;
  type: string;
  publishAt: string;
  destinationId?: string;
  destinationName?: string;
  featuredImageUrl?: string;
  seoMeta?: string;
  schemaMarkup?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: string;
  categories?: string[];
  tags?: string[];
}

interface PostFormProps {
  type: 'post' | 'page';
  mode: 'create' | 'edit';
}

const PostForm: React.FC<PostFormProps> = ({ type, mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      type: type,
      status: 'draft',
      publishAt: new Date().toISOString().slice(0, 16),
      destinationName: '',
    },
  });

  // Load existing post data for edit mode
  const { data: postData } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getById(id!),
    enabled: mode === 'edit' && !!id,
  });

  const createMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(`${type === 'post' ? 'Post' : 'Page'} created successfully`);
      navigate(`/cms/${type}s`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) =>
      postsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(`${type === 'post' ? 'Post' : 'Page'} updated successfully`);
      navigate(`/cms/${type}s`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update');
    },
  });

  // Auto-generate slug from title
  const watchTitle = watch('title');
  useEffect(() => {
    if (watchTitle && mode === 'create') {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchTitle, setValue, mode]);

  // Load data for edit mode
  useEffect(() => {
    if (mode === 'edit' && postData) {
      reset({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        body: postData.body || postData.content || '',
        status: postData.status,
        type: postData.type,
        publishAt: postData.publishAt ? new Date(postData.publishAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        featuredImageUrl: postData.featuredImageUrl || '',
        seoMeta: postData.seoMeta || '',
        destinationName: postData.destinationName || '',
        destinationId: postData.destinationId || '',
        schemaMarkup: postData.schemaMarkup || '',
        canonicalUrl: postData.canonicalUrl || '',
        metaRobots: postData.metaRobots || '',
        structuredData: postData.structuredData || '',
        categories: postData.categories?.map(cat => cat.id) || [],
        tags: postData.tags?.map(tag => tag.id) || [],
      });
    }
  }, [postData, reset, mode]);

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      const postData: Partial<Post> = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        status: data.status,
        type: data.type,
        publishAt: data.publishAt,
        destinationName: data.destinationName,
        destinationId: data.destinationId,
        featuredImageUrl: data.featuredImageUrl,
        seoMeta: data.seoMeta,
        schemaMarkup: data.schemaMarkup,
        canonicalUrl: data.canonicalUrl,
        metaRobots: data.metaRobots,
        structuredData: data.structuredData,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(postData);
      } else if (id) {
        await updateMutation.mutateAsync({ id, data: postData });
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/cms/${type}s`);
  };

  return (
    <TenantGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-title-md font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Create' : 'Edit'} {type === 'post' ? 'Post' : 'Page'}
            </h1>
            <p className="text-theme-sm text-gray-600 dark:text-gray-400">
              {mode === 'create' ? 'Create a new' : 'Edit existing'} {type}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter title..."
                    />
                    {errors.title && (
                      <p className="text-sm text-error-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      {...register('slug', { required: 'Slug is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="enter-slug"
                    />
                    {errors.slug && (
                      <p className="text-sm text-error-600 mt-1">{errors.slug.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      {...register('excerpt')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destination Name
                    </label>
                    <input
                      type="text"
                      {...register('destinationName')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Destination name..."
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  {...register('body')}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Write your content here..."
                />
              </div>

              {/* SEO Settings */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  SEO Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Meta
                    </label>
                    <input
                      type="text"
                      {...register('seoMeta')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="SEO meta information..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      {...register('canonicalUrl')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Robots
                    </label>
                    <input
                      type="text"
                      {...register('metaRobots')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="index, follow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schema Markup
                    </label>
                    <textarea
                      {...register('schemaMarkup')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="JSON-LD schema markup..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Structured Data
                    </label>
                    <textarea
                      {...register('structuredData')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Additional structured data..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Publish Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      {...register('publishAt')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Featured Image
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      {...register('featuredImageUrl')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {watch('featuredImageUrl') && (
                    <div>
                      <img
                        src={watch('featuredImageUrl')}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : mode === 'create'
                      ? `Create ${type === 'post' ? 'Post' : 'Page'}`
                      : `Update ${type === 'post' ? 'Post' : 'Page'}`}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </TenantGuard>
  );
};

export default PostForm;
