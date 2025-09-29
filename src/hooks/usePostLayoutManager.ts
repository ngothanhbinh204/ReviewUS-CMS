import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PostLayoutData, ImportStats } from '../types/postLayout.types';
import postLayoutService from '../services/postLayoutService';

export interface UsePostLayoutManagerReturn {
  // State
  layoutData: PostLayoutData[];
  selectedItems: Set<string>;
  isImporting: boolean;
  isCreatingBulk: boolean;
  isGeneratingBulk: boolean;
  currentPage: number;
  searchTerm: string;
  dateFilter: string; // Changed from statusFilter to dateFilter
  showPreview: boolean;
  previewData: PostLayoutData | null;
  showEditModal: boolean;
  editData: PostLayoutData | null;
  
  // Computed
  filteredData: PostLayoutData[];
  paginatedData: PostLayoutData[];
  totalPages: number;
  stats: ImportStats;
  importStats: {
    total: number;
    imported: number;
    ready: number;
    need_generate: number;
    processing: number;
  };
  
  // Actions
  handleImportFromSheets: () => Promise<void>;
  handleCreatePost: (item: PostLayoutData) => Promise<void>;
  handleBulkCreate: () => Promise<void>;
  handleGenerateContent: (item: PostLayoutData) => Promise<void>;
  handleBulkGenerate: () => Promise<void>;
  handleSelectAll: () => void;
  handleSelectItem: (id: string) => void;
  handlePreview: (item: PostLayoutData) => void;
  handleClosePreview: () => void;
  handleEdit: (item: PostLayoutData) => void;
  handleCloseEdit: () => void;
  handleSaveEdit: (updatedData: PostLayoutData) => void;
  handleSearch: (term: string) => void;
  handleDateFilter: (date: string) => void; // Changed from handleStatusFilter
  handlePageChange: (page: number) => void;
  
  // Setters
  setCurrentPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setDateFilter: (date: string) => void;
  exportData: () => void;
}

export const usePostLayoutManager = (itemsPerPage: number = 10): UsePostLayoutManagerReturn => {
  // State
  const [layoutData, setLayoutData] = useState<PostLayoutData[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all'); // Changed from statusFilter
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PostLayoutData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<PostLayoutData | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    imported: number;
    ready: number;
    need_generate: number;
    processing: number;
  }>({
    total: 0,
    imported: 0,
    ready: 0,
    need_generate: 0,
    processing: 0
  });

  // Computed values with date filtering
  const filteredData = layoutData.filter(item => {
    const matchesSearch = item.outline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.meta_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dateFilter === 'all') {
      return matchesSearch;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const itemDate = item.import_date || item.created_at?.split('T')[0] || today;
    
    let matchesDate = false;
    switch (dateFilter) {
      case 'today':
        matchesDate = itemDate === today;
        break;
      case 'yesterday':
        matchesDate = itemDate === yesterday;
        break;
      case 'this_week':
        matchesDate = itemDate >= weekAgo;
        break;
      default:
        // Custom date filter (YYYY-MM-DD format)
        matchesDate = itemDate === dateFilter;
    }
    
    return matchesSearch && matchesDate;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const stats: ImportStats = {
    total: layoutData.length,
    pending: layoutData.filter(item => item.status === 'pending').length,
    ready: layoutData.filter(item => item.status === 'ready').length,
    created: layoutData.filter(item => item.status === 'created').length,
    generating: layoutData.filter(item => item.status === 'generating').length,
    error: layoutData.filter(item => item.status === 'error').length,
    need_generate: layoutData.filter(item => item.status === 'need_generate').length,
    
    // Date-based stats
    today: layoutData.filter(item => {
      const today = new Date().toISOString().split('T')[0];
      const itemDate = item.import_date || item.created_at?.split('T')[0] || '';
      return itemDate === today;
    }).length,
    yesterday: layoutData.filter(item => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const itemDate = item.import_date || item.created_at?.split('T')[0] || '';
      return itemDate === yesterday;
    }).length,
    this_week: layoutData.filter(item => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const itemDate = item.import_date || item.created_at?.split('T')[0] || '';
      return itemDate >= weekAgo;
    }).length,
  };

  // Reset pagination when filters change   
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  // Import from Google Sheets
  const handleImportFromSheets = useCallback(async () => {
    setIsImporting(true);
    try {
      // Use REAL Google Sheets API
      const importedData = await postLayoutService.importFromGoogleSheets();
      
      setLayoutData(importedData);
      
      // Update import stats
      const readyCount = importedData.filter(item => item.status === 'ready').length;
      const needGenerateCount = importedData.filter(item => item.status === 'need_generate').length;
      const pendingCount = importedData.filter(item => item.status === 'pending').length;
      
      setImportStats({
        total: importedData.length,
        imported: importedData.length,
        ready: readyCount,
        need_generate: needGenerateCount,
        processing: pendingCount
      });
      
      setSelectedItems(new Set()); // Clear selection
      toast.success(`Successfully imported ${importedData.length} posts from Google Sheets!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to import data from Google Sheets: ${errorMessage}`);
      console.error('Import error:', error);
      
      // Fallback to mock data if real API fails
      try {
        console.log('Falling back to mock data...');
        const mockData = await postLayoutService.mockImportFromGoogleSheets();
        setLayoutData(mockData);
        
        // Update stats for mock data too
        const readyCount = mockData.filter(item => item.status === 'ready').length;
        const needGenerateCount = mockData.filter(item => item.status === 'need_generate').length;
        const pendingCount = mockData.filter(item => item.status === 'pending').length;
        
        setImportStats({
          total: mockData.length,
          imported: mockData.length,
          ready: readyCount,
          need_generate: needGenerateCount,
          processing: pendingCount
        });
        
        toast.success('Using mock data as fallback');
      } catch (mockError) {
        console.error('Mock fallback also failed:', mockError);
      }
    } finally {
      setIsImporting(false);
    }
  }, []);

  // Trigger n8n for content generation
  const triggerN8nContentGeneration = useCallback(async (item: PostLayoutData, postId: string) => {
    try {
      // Use mock trigger for development
      const n8nResult = await postLayoutService.triggerContentGeneration(item, postId);
        
      // Update status to created after n8n trigger
      setLayoutData(prev => prev.map(data => 
        data.id === item.id 
          ? { ...data, status: 'created', n8n_trigger_id: n8nResult.trigger_id }
          : data
      ));
    } catch (error) {
      console.error('n8n trigger error:', error);
      // Set status to error on n8n trigger failure
      setLayoutData(prev => prev.map(data => 
        data.id === item.id 
          ? { ...data, status: 'error', error_message: 'Failed to trigger content generation' } 
          : data
      ));
    }
  }, []);

  // Create individual post
  const handleCreatePost = useCallback(async (item: PostLayoutData) => {
    try {
      // Validate data first
      const validation = postLayoutService.validatePostData(item);
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // Update status to generating immediately
      setLayoutData(prev => prev.map(data => 
        data.id === item.id ? { ...data, status: 'generating' } : data
      ));

      // Create post via service with proper API call
      const createdPost = await postLayoutService.createPost(item);
        
      // Update local state with post ID and created timestamp
      setLayoutData(prev => prev.map(data => 
        data.id === item.id 
          ? { 
              ...data, 
              status: 'created',
              api_post_id: createdPost.data.id,
              created_at: new Date().toISOString()
            }
          : data
      ));

      // Trigger n8n for content generation if needed
      if (item.status === 'need_generate' || !item.content) {
        await triggerN8nContentGeneration(item, createdPost.data.id);
      }
      
      toast.success(`Post "${item.meta_title}" created successfully!`);
    } catch (error) {
      // Update status to error
      setLayoutData(prev => prev.map(data => 
        data.id === item.id 
          ? { ...data, status: 'error', error_message: (error as Error).message }
          : data
      ));
      
      toast.error(`Failed to create post: ${item.meta_title}`);
      console.error('Create post error:', error);
    }
  }, [triggerN8nContentGeneration]);

  // Bulk create posts
  const handleBulkCreate = useCallback(async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one post to create');
      return;
    }

    setIsCreatingBulk(true);
    const selectedData = layoutData.filter(item => 
      selectedItems.has(item.id) && 
      (item.status === 'ready' || item.status === 'pending')
    );
    
    if (selectedData.length === 0) {
      toast.error('No valid posts to create (selected posts are not ready)');
      setIsCreatingBulk(false);
      return;
    }
    
    try {
      let successCount = 0;
      let errorCount = 0;

      // Process sequentially to avoid overwhelming the API
      for (const item of selectedData) {
        try {
          await handleCreatePost(item);
          successCount++;
          
          // Small delay between requests to be API-friendly
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          errorCount++;
          console.error(`Failed to create post ${item.id}:`, error);
        }
      }

      toast.success(`Bulk creation completed: ${successCount} successful, ${errorCount} failed`);
      setSelectedItems(new Set()); // Clear selection
    } catch (error) {
      toast.error('Bulk creation failed');
      console.error('Bulk create error:', error);
    } finally {
      setIsCreatingBulk(false);
    }
  }, [selectedItems, layoutData, handleCreatePost]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    const selectableItems = paginatedData.filter(item => 
      item.status === 'ready' || item.status === 'pending'
    );
    
    if (selectedItems.size === selectableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(selectableItems.map(item => item.id)));
    }
  }, [paginatedData, selectedItems.size]);

  const handleSelectItem = useCallback((id: string) => {
    const item = layoutData.find(item => item.id === id);
    if (!item || (item.status !== 'ready' && item.status !== 'pending')) {
      return; // Don't allow selection of non-creatable items
    }

    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  }, [selectedItems, layoutData]);

  // Generate content for individual layout
  const handleGenerateContent = useCallback(async (item: PostLayoutData) => {
    try {
      // Update status to generating immediately
      console.log('Generating content for item:', item);
      setLayoutData(prev => prev.map(data => 
        data.id === item.id ? { ...data, status: 'generating' } : data
      ));

      // Generate content via service
      const result = await postLayoutService.mockGenerateContent(item);
              console.log('Result:', result);

      // Update local state with generated content
      setLayoutData(prev => prev.map(data => 
        data.id === item.id 
          ? { 
              ...data, 
              status: 'ready', 
              content: result.content,
              body: result.content,
              n8n_trigger_id: result.trigger_id 
            }
          : data
      ));
      
      toast.success(`Content generated for "${item.meta_title}"!`);
    } catch (error) {
        console.error('Generate content error:', error);
      // Update status to error
      setLayoutData(prev => prev.map(data => 
        data.id === item.id 
          ? { ...data, status: 'error', error_message: (error as Error).message }
          : data
      ));
      
      toast.error(`Failed to generate content: ${item.meta_title}`);
      console.error('Generate content error:', error);
    }
  }, []);

  // Bulk generate content
  const handleBulkGenerate = useCallback(async () => {
    const needGenerateItems = layoutData.filter(item => 
      selectedItems.has(item.id) && item.status === 'need_generate'
    );

    if (needGenerateItems.length === 0) {
      toast.error('Please select at least one item that needs content generation');
      return;
    }

    setIsGeneratingBulk(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;

      // Process sequentially to avoid overwhelming the API
      for (const item of needGenerateItems) {
        try {
          await handleGenerateContent(item);
          successCount++;
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          errorCount++;
          console.error(`Failed to generate content for ${item.id}:`, error);
        }
      }

      toast.success(`Bulk generation completed: ${successCount} successful, ${errorCount} failed`);
      setSelectedItems(new Set()); // Clear selection
    } catch (error) {
      toast.error('Bulk generation failed');
      console.error('Bulk generate error:', error);
    } finally {
      setIsGeneratingBulk(false);
    }
  }, [selectedItems, layoutData, handleGenerateContent]);

  // Edit handlers
  const handleEdit = useCallback((item: PostLayoutData) => {
    setEditData(item);
    setShowEditModal(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEditModal(false);
    setEditData(null);
  }, []);

  const handleSaveEdit = useCallback((updatedData: PostLayoutData) => {
    setLayoutData(prev => prev.map(data => 
      data.id === updatedData.id ? updatedData : data
    ));
    handleCloseEdit();
  }, [handleCloseEdit]);

  // Preview handlers
  const handlePreview = useCallback((item: PostLayoutData) => {
    setPreviewData(item);
    setShowPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewData(null);
  }, []);

  // Export data to CSV
  const exportData = useCallback(() => {
    if (layoutData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    try {
      const filename = `post-layouts-${new Date().toISOString().split('T')[0]}`;
      postLayoutService.exportToCSV(layoutData, filename);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  }, [layoutData]);

  return {
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
    dateFilter,
    
    // Computed data
    filteredData,
    paginatedData,
    stats,
    
    // Import stats
    importStats,
    
    // Basic handlers
    handleSearch: (term: string) => setSearchTerm(term),
    handleDateFilter: (date: string) => setDateFilter(date),
    handlePageChange: (page: number) => setCurrentPage(page),
    
    // Selection handlers
    handleSelectItem,
    handleSelectAll,
    
    // Import/Create handlers
    handleImportFromSheets,
    handleCreatePost,
    handleBulkCreate,
    
    // Generate/Edit handlers
    handleGenerateContent,
    handleBulkGenerate,
    handleEdit,
    handleSaveEdit,
    handleCloseEdit,
    
    // Preview handlers
    handlePreview,
    handleClosePreview,
    
    // Legacy setters for backward compatibility
    setCurrentPage,
    setSearchTerm,
    setDateFilter,
    
    // Utility handlers
    exportData,
    };
};