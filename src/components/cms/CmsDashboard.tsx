import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostsList from './PostsList';
import PostForm from './PostForm';
import MediaList from './MediaList';
import TaxonomiesList from './TaxonomiesList';
import CommentsList from './CommentsList';
import TenantsList from './TenantsList';

const CmsDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    {
      name: 'Posts',
      href: '/cms/posts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Media',
      href: '/cms/media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Categories',
      href: '/cms/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      name: 'Tags',
      href: '/cms/tags',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      name: 'Comments',
      href: '/cms/comments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  // Add tenants for super admin
  if (user.role === 'super_admin') {
    navigation.push({
      name: 'Tenants',
      href: '/cms/tenants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    });
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              CMS Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Multi-tenant CMS
            </p>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-8">
            <Routes>
              {/* Posts Routes */}
              <Route path="/posts" element={<PostsList />} />
              <Route path="/posts/new" element={<PostForm type="post" mode="create" />} />
              <Route path="/posts/edit/:id" element={<PostForm type="post" mode="edit" />} />

              {/* Media Route */}
              <Route path="/media" element={<MediaList />} />

              {/* Taxonomies Routes */}
              <Route path="/categories" element={<TaxonomiesList type="category" />} />
              <Route path="/tags" element={<TaxonomiesList type="tag" />} />

              {/* Comments Route */}
              <Route path="/comments" element={<CommentsList />} />

              {/* Tenants Route (Super Admin only) */}
              {user.role === 'super_admin' && (
                <Route path="/tenants" element={<TenantsList />} />
              )}

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/cms/posts" replace />} />
              <Route path="*" element={<Navigate to="/cms/posts" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CmsDashboard;
