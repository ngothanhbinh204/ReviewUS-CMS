import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxonomiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  type: 'category' | 'tag';
  parent_id?: string;
  description?: string;
  created_at: string;
  posts_count: number;
}

interface TaxonomyFormData {
  name: string;
  slug: string;
  type: 'category' | 'tag';
  parent_id?: string;
  description?: string;
}

interface TaxonomiesListProps {
  type: 'category' | 'tag';
}

const TaxonomiesList: React.FC<TaxonomiesListProps> = ({ type }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTaxonomy, setEditingTaxonomy] = useState<Taxonomy | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaxonomyFormData>({
    defaultValues: {
      type,
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['taxonomies', type, page, search, user?.current_tenant_id],
    queryFn: () => taxonomiesApi.getAll({
      page,
      limit: 20,
      type,
      search: search || undefined,
    }),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: taxonomiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      toast.success(`${type} created successfully`);
      resetForm();
    },
    onError: () => {
      toast.error(`Failed to create ${type}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      taxonomiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      toast.success(`${type} updated successfully`);
      resetForm();
    },
    onError: () => {
      toast.error(`Failed to update ${type}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taxonomiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      toast.success(`${type} deleted successfully`);
    },
    onError: () => {
      toast.error(`Failed to delete ${type}`);
    },
  });

  // Auto-generate slug from name
  const watchName = watch('name');
  React.useEffect(() => {
    if (watchName && !editingTaxonomy) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [watchName, setValue, editingTaxonomy]);

  const resetForm = () => {
    reset({ type });
    setShowForm(false);
    setEditingTaxonomy(null);
  };

  const onSubmit = async (data: TaxonomyFormData) => {
    try {
      if (editingTaxonomy) {
        updateMutation.mutate({ id: editingTaxonomy.id, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (taxonomy: Taxonomy) => {
    setEditingTaxonomy(taxonomy);
    reset({
      name: taxonomy.name,
      slug: taxonomy.slug,
      type: taxonomy.type,
      parent_id: taxonomy.parent_id,
      description: taxonomy.description,
    });
    setShowForm(true);
  };

  const handleDelete = (taxonomy: Taxonomy) => {
    if (window.confirm(`Are you sure you want to delete "${taxonomy.name}"?`)) {
      deleteMutation.mutate(taxonomy.id);
    }
  };

  const taxonomies = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.total || 0) / 20);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg">
        Failed to load {type}s. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-title-md font-semibold text-gray-900 dark:text-white">
            {type === 'category' ? 'Categories' : 'Tags'}
          </h1>
          <p className="text-theme-sm text-gray-600 dark:text-gray-400">
            Organize your content with {type}s
          </p>
        </div>
        <button
          onClick={() => {
            reset({ type });
            setShowForm(true);
            setEditingTaxonomy(null);
          }}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add {type === 'category' ? 'Category' : 'Tag'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        {showForm && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingTaxonomy ? 'Edit' : 'Add'} {type === 'category' ? 'Category' : 'Tag'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter ${type} name`}
                  />
                  {errors.name && (
                    <p className="text-error-600 text-sm mt-1">{errors.name.message}</p>
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
                    placeholder="url-slug"
                  />
                  {errors.slug && (
                    <p className="text-error-600 text-sm mt-1">{errors.slug.message}</p>
                  )}
                </div>

                {type === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parent Category
                    </label>
                    <select
                      {...register('parent_id')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">None (Top Level)</option>
                      {taxonomies
                        .filter((tax: Taxonomy) => tax.id !== editingTaxonomy?.id)
                        .map((tax: Taxonomy) => (
                          <option key={tax.id} value={tax.id}>
                            {tax.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter ${type} description...`}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingTaxonomy ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* Search */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm mb-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search {type}s
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${type}s...`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Slug
                    </th>
                    {type === 'category' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Parent
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {taxonomies.map((taxonomy: Taxonomy) => (
                    <tr key={taxonomy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {taxonomy.name}
                          </div>
                          {taxonomy.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {taxonomy.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {taxonomy.slug}
                      </td>
                      {type === 'category' && (
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {taxonomy.parent_id ? (
                            taxonomies.find((t: Taxonomy) => t.id === taxonomy.parent_id)?.name || 'Unknown'
                          ) : (
                            '-'
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                          {taxonomy.posts_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(taxonomy)}
                          className="text-brand-600 hover:text-brand-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(taxonomy)}
                          className="text-error-600 hover:text-error-900"
                          disabled={taxonomy.posts_count > 0}
                          title={
                            taxonomy.posts_count > 0
                              ? `Cannot delete ${type} with posts`
                              : `Delete ${type}`
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxonomiesList;
