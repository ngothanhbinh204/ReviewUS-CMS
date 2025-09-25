import React from "react";
import { SharedMedia } from "../../components/media";

export const SharedMediaPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Shared Media
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage media shared between tenants and collaborate on content.
        </p>
      </div>
      
      <SharedMedia />
    </div>
  );
};
