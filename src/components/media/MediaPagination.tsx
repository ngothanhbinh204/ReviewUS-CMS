// =================================================================
// MEDIA PAGINATION COMPONENT
// =================================================================

import React from 'react';

interface PaginationInfo {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface MediaPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const MediaPagination: React.FC<MediaPaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const { pageNumber, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage } = pagination;

  // Calculate page range to show
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Calculate start and end of middle range
    const start = Math.max(2, pageNumber - delta);
    const end = Math.min(totalPages - 1, pageNumber + delta);

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add dots where needed
    let previous = 0;
    for (const page of uniqueRange) {
      if (page - previous > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      previous = page;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  // Calculate showing range
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
      {/* Showing Info */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Showing {startItem} to {endItem} of {totalCount} results
        </span>

        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Show:
          </label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex items-center space-x-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={!hasPreviousPage}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const isCurrentPage = page === pageNumber;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 text-sm font-medium border ${
                  isCurrentPage
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-400'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={!hasNextPage}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </nav>
      )}

      {/* Quick Jump */}
      {totalPages > 10 && (
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Go to page:
          </label>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageNumber}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      )}
    </div>
  );
};
