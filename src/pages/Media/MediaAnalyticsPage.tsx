import React from "react";
import { MediaAnalytics } from "../../components/media";

export const MediaAnalyticsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Media Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track media usage, performance, and insights across your content.
        </p>
      </div>
      
      <MediaAnalytics />
    </div>
  );
};
