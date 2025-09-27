import React from 'react';
import { 
  Download, 
  FileText, 
  Play,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Edit,
  Zap,
  Loader
} from 'lucide-react';
import { PostLayoutData } from '../../types/postLayout.types';
import { usePostLayoutManager } from '../../hooks/usePostLayoutManager';
import EditPostLayoutModal from './EditPostLayoutModal';

const PostLayoutManager: React.FC = () => {
  const {
    // Data
    layoutData,
    selectedItems,
    
    // Loading states  
    isImporting,
    isCreatingBulk,
    isGeneratingBulk,
    
    // Modal states
    showEditModal,
    showPreview,
    
    // Data for modals
    editData,
    previewData,
    
    // Pagination
    currentPage,
    totalPages,
    
    // Filters
    searchTerm,
    statusFilter,
    
    // Computed data
    filteredData,
    paginatedData,
    stats,
    
    // Import stats
    importStats,
    
    // Actions
    handleImportFromSheets,
    handleCreatePost,
    handleBulkCreate,
    handleSelectAll,
    handleSelectItem,
    
    // Generate/Edit handlers
    handleGenerateContent,
    handleBulkGenerate,
    handleEdit,
    handleSaveEdit,
    handleCloseEdit,
    
    // Preview handlers
    handlePreview,
    handleClosePreview,
    
    // Legacy setters
    setCurrentPage,
    setSearchTerm,
    setStatusFilter,
    exportData,
  } = usePostLayoutManager(10);

  // Status badge component
  const StatusBadge: React.FC<{ status: PostLayoutData['status'] }> = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Pending' },
      ready: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Ready' },
      created: { color: 'bg-green-100 text-green-800', icon: FileText, text: 'Created' },
      generating: { color: 'bg-purple-100 text-purple-800', icon: RotateCw, text: 'Generating' },
      error: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Error' },
      need_generate: { color: 'bg-orange-100 text-orange-800', icon: Zap, text: 'Needs Content' }
    } as const;

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Layout Manager</h1>
        <p className="text-gray-600">
          Import post layouts from Google Sheets and create posts in bulk or individually
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ready</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.ready}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <RotateCw className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Generating</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.generating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-2xl font-semibold text-green-600">{stats.created}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleImportFromSheets}
                disabled={isImporting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <RotateCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                ) : (
                  <Download className="-ml-1 mr-2 h-4 w-4" />
                )}
                {isImporting ? 'Importing...' : 'Import from Google Sheets'}
              </button>

              {layoutData.length > 0 && (
                <>
                  <button
                    onClick={handleBulkCreate}
                    disabled={selectedItems.size === 0 || isCreatingBulk}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingBulk ? (
                      <RotateCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    ) : (
                      <Play className="-ml-1 mr-2 h-4 w-4" />
                    )}
                    {isCreatingBulk ? 'Creating...' : `Create Selected (${selectedItems.size})`}
                  </button>

                  <button
                    onClick={handleBulkGenerate}
                    disabled={
                      selectedItems.size === 0 || 
                      isGeneratingBulk || 
                      Array.from(selectedItems).every(id => 
                        layoutData.find(item => item.id === id)?.status !== 'need_generate'
                      )
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingBulk ? (
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    ) : (
                      <Zap className="-ml-1 mr-2 h-4 w-4" />
                    )}
                    {isGeneratingBulk ? 'Generating...' : `Generate Selected`}
                  </button>
                </>
              )}
            </div>

            {selectedItems.size > 0 && (
              <div className="text-sm text-gray-500">
                {selectedItems.size} of {filteredData.length} selected
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {layoutData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by title, keyword, or outline..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                  <option value="generating">Generating</option>
                  <option value="created">Created</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {layoutData.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Post Layouts ({filteredData.length})
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <label className="text-sm text-gray-600">Select All</label>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="mt-1 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.meta_title}
                        </h4>
                        <StatusBadge status={item.status} />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.outline}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="font-medium">Keyword:</span>
                          <span className="ml-1 px-2 py-1 bg-gray-100 rounded">{item.keyword}</span>
                        </span>
                        {item.created_at && (
                          <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                        )}
                        {item.api_post_id && (
                          <span>Post ID: {item.api_post_id}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Edit Button - Always available */}
                    <button
                      onClick={() => handleEdit(item)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>

                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreview(item)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </button>

                    {/* Generate Content Button - For items that need content generation */}
                    {item.status === 'need_generate' && (
                      <button
                        onClick={() => handleGenerateContent(item)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Generate
                      </button>
                    )}

                    {/* Show generating status for items being generated */}
                    {item.status === 'generating' && (
                      <button
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 cursor-not-allowed"
                        disabled
                      >
                        <Loader className="w-3 h-3 mr-1 animate-spin" />
                        Generating...
                      </button>
                    )}

                    {/* Create Post Button - For ready items */}
                    {(item.status === 'ready' || item.status === 'pending') && (
                      <button
                        onClick={() => handleCreatePost(item)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Create Post
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, filteredData.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredData.length}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {layoutData.length === 0 && (
        <div className="text-center py-12">
          <Download className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No post layouts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by importing post layouts from Google Sheets.
          </p>
          <div className="mt-6">
            <button
              onClick={handleImportFromSheets}
              disabled={isImporting}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <RotateCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              ) : (
                <Download className="-ml-1 mr-2 h-5 w-5" />
              )}
              {isImporting ? 'Importing...' : 'Import from Google Sheets'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Post Layout Preview</h3>
              <button
                onClick={handleClosePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <p className="p-3 bg-gray-50 rounded-md text-sm">{previewData.meta_title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <p className="p-3 bg-gray-50 rounded-md text-sm">{previewData.meta_description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                <p className="p-3 bg-gray-50 rounded-md text-sm">{previewData.keyword}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outline</label>
                <p className="p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">{previewData.outline}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <StatusBadge status={previewData.status} />
                {(previewData.status === 'ready' || previewData.status === 'pending') && (
                  <button
                    onClick={() => {
                      handleCreatePost(previewData);
                      handleClosePreview();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditPostLayoutModal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        data={editData}
      />
    </div>
  );
};

export default PostLayoutManager;