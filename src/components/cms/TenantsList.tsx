import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    theme?: string;
    logo_url?: string;
    primary_color?: string;
    timezone?: string;
    language?: string;
    currency?: string;
  };
  subscription?: {
    plan: string;
    status: string;
    expires_at?: string;
  };
  created_at: string;
  updated_at: string;
  users_count: number;
  posts_count: number;
}

interface TenantFormData {
  name: string;
  domain: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    theme?: string;
    logo_url?: string;
    primary_color?: string;
    timezone?: string;
    language?: string;
    currency?: string;
  };
  subscription?: {
    plan: string;
    status: string;
    expires_at?: string;
  };
}

const TenantsList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormData>({
    defaultValues: {
      status: 'active',
      settings: {
        theme: 'default',
        timezone: 'UTC',
        language: 'en',
        currency: 'USD',
      },
    },
  });

  // Only super admin can access tenants
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg">
        Access denied. Only super administrators can manage tenants.
      </div>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenants', page, search, status],
    queryFn: () => tenantsApi.getAll({
      page,
      limit: 20,
      search: search || undefined,
      status: status !== 'all' ? status : undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: tenantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant created successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create tenant');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tenantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant updated successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update tenant');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tenantsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete tenant');
    },
  });

  // Auto-generate subdomain from name
  const watchName = watch('name');
  React.useEffect(() => {
    if (watchName && !editingTenant) {
      const subdomain = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('subdomain', subdomain);
    }
  }, [watchName, setValue, editingTenant]);

  const resetForm = () => {
    reset({
      status: 'active',
      settings: {
        theme: 'default',
        timezone: 'UTC',
        language: 'en',
        currency: 'USD',
      },
    });
    setShowForm(false);
    setEditingTenant(null);
  };

  const onSubmit = async (data: TenantFormData) => {
    try {
      if (editingTenant) {
        updateMutation.mutate({ id: editingTenant.id, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    reset({
      name: tenant.name,
      domain: tenant.domain,
      subdomain: tenant.subdomain,
      status: tenant.status,
      settings: tenant.settings || {
        theme: 'default',
        timezone: 'UTC',
        language: 'en',
        currency: 'USD',
      },
      subscription: tenant.subscription,
    });
    setShowForm(true);
  };

  const handleDelete = (tenant: Tenant) => {
    if (window.confirm(`Are you sure you want to delete "${tenant.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(tenant.id);
    }
  };

  const getStatusColor = (status: Tenant['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-100';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      case 'suspended':
        return 'bg-error-100 text-error-800 dark:bg-error-800 dark:text-error-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

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
        Failed to load tenants. Please try again.
      </div>
    );
  }

  const tenants = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.total || 0) / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-title-md font-semibold text-gray-900 dark:text-white">
            Tenants Management
          </h1>
          <p className="text-theme-sm text-gray-600 dark:text-gray-400">
            Manage all tenants and their configurations
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Form */}
        {showForm && (
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingTenant ? 'Edit' : 'Add'} Tenant
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Tenant name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter tenant name"
                  />
                  {errors.name && (
                    <p className="text-error-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Domain *
                  </label>
                  <input
                    type="text"
                    {...register('domain', { required: 'Domain is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="example.com"
                  />
                  {errors.domain && (
                    <p className="text-error-600 text-sm mt-1">{errors.domain.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subdomain *
                  </label>
                  <input
                    type="text"
                    {...register('subdomain', { required: 'Subdomain is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="tenant-slug"
                  />
                  {errors.subdomain && (
                    <p className="text-error-600 text-sm mt-1">{errors.subdomain.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    {...register('settings.theme')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="default">Default</option>
                    <option value="dark">Dark</option>
                    <option value="minimal">Minimal</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    {...register('settings.primary_color')}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    {...register('settings.logo_url')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingTenant ? 'Update' : 'Create'}
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
        <div className={showForm ? 'xl:col-span-3' : 'xl:col-span-4'}>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Tenants
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, domain..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Filter
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tenants.map((tenant: Tenant) => (
              <div
                key={tenant.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {tenant.settings?.logo_url ? (
                      <img
                        src={tenant.settings.logo_url}
                        alt={tenant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {tenant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tenant.domain}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subdomain:</span>
                    <span className="text-gray-900 dark:text-white">{tenant.subdomain}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Users:</span>
                    <span className="text-gray-900 dark:text-white">{tenant.users_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Posts:</span>
                    <span className="text-gray-900 dark:text-white">{tenant.posts_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(tenant.created_at)}</span>
                  </div>
                </div>

                {tenant.subscription && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {tenant.subscription.plan}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-gray-900 dark:text-white">
                          {tenant.subscription.status}
                        </span>
                      </div>
                      {tenant.subscription.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(tenant.subscription.expires_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="flex-1 bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tenant)}
                    className="bg-error-50 text-error-700 hover:bg-error-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    disabled={tenant.users_count > 0 || tenant.posts_count > 0}
                    title={
                      tenant.users_count > 0 || tenant.posts_count > 0
                        ? 'Cannot delete tenant with users or posts'
                        : 'Delete tenant'
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantsList;
