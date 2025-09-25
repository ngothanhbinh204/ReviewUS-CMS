// =================================================================
// MEDIA MANAGEMENT PAGE
// =================================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MediaLibrary } from '../../components/media/MediaLibrary';
import { MediaAnalyticsPage } from './MediaAnalyticsPage';
import { SharedMediaPage } from './SharedMediaPage';

const MediaManagementPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainMediaPage />} />
      <Route path="/analytics" element={<MediaAnalyticsPage />} />
      <Route path="/shared" element={<SharedMediaPage />} />
      <Route path="*" element={<Navigate to="/media" replace />} />
    </Routes>
  );
};

const MainMediaPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your media files, images, videos, and documents
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <button className="btn btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import
          </button>
          <button className="btn btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Media Library Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <MediaLibrary 
          showUpload={true}
          className="p-6"
        />
      </div>
    </div>
  );
};

export default MediaManagementPage;
