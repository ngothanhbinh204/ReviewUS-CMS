// =================================================================
// MEDIA MANAGEMENT REACT HOOKS
// =================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaService } from '../services/mediaService';
import { 
  MediaDto,
  MediaQueryParams,
  MediaState,
  MediaLoadingState,
  CreateMediaDto,
  UpdateMediaDto,
  MediaAnalyticsDto,
  MediaShareDto
} from '../types/media.types';

// =================================================================
// MAIN MEDIA HOOK
// =================================================================

export const useMedia = (initialParams?: MediaQueryParams) => {
  const [state, setState] = useState<MediaState>({
    items: [],
    loading: 'idle',
    error: null,
    pagination: {
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 20,
      hasPreviousPage: false,
      hasNextPage: false
    },
    filters: initialParams || {},
    selectedItems: []
  });

  // =================================================================
  // FETCH MEDIA LIST
  // =================================================================
  
  const fetchMedia = useCallback(async (params?: MediaQueryParams, forceRefresh = false) => {
    setState(prev => ({ ...prev, loading: 'loading', error: null }));
    
    try {
      const response = forceRefresh 
        ? await mediaService.getMediaFresh({
            ...state.filters,
            ...params
          }) as any
        : await mediaService.getMedia({
            ...state.filters,
            ...params
          }) as any; // Use any to handle actual API response structure

      console.log('MediaService response:', response); // Debug log

      // Handle actual API response structure: { items: [], totalCount: number, ... }
      if (response && (response.items || response.data)) {
        const mediaItems = response.items || response.data || [];
        
        setState(prev => ({
          ...prev,
          items: Array.isArray(mediaItems) ? mediaItems : [],
          loading: 'success',
          pagination: {
            pageNumber: response.pageNumber || 1,
            totalPages: response.totalPages || Math.ceil((response.totalCount || 0) / (response.pageSize || 20)),
            totalCount: response.totalCount || 0,
            pageSize: response.pageSize || 20,
            hasPreviousPage: (response.pageNumber || 1) > 1,
            hasNextPage: (response.pageNumber || 1) < (response.totalPages || Math.ceil((response.totalCount || 0) / (response.pageSize || 20)))
          },
          filters: { ...prev.filters, ...params }
        }));
      } else {
        console.error('API response error:', response);
        setState(prev => ({
          ...prev,
          loading: 'error',
          error: response?.message || 'Failed to fetch media'
        }));
      }
    } catch (error: any) {
      console.error('Network error:', error);
      setState(prev => ({
        ...prev,
        loading: 'error',
        error: error.message || 'Network error occurred while fetching media'
      }));
    }
  }, [state.filters]);

  // =================================================================
  // UPLOAD MEDIA
  // =================================================================

  const uploadMedia = useCallback(async (files: File[], metadata?: Partial<CreateMediaDto>) => {
    setState(prev => ({ ...prev, loading: 'uploading', error: null }));

    try {
      const uploadPromises = files.map(file => 
        mediaService.uploadMedia({
          file,
          ...metadata
        })
      );

      const results = await Promise.allSettled(uploadPromises);
      console.log('Upload results:', results); // Debug log

      const successful = results
        .filter((result): result is PromiseFulfilledResult<any> => {
          if (result.status !== 'fulfilled') return false;
          // Check if upload was successful - either has success field or has data
          const response = result.value;
          return Boolean((response.success === true) || (response.data && response.data.id));
        })
        .map(result => {
          const response = result.value;
          return response.data || response; // Get the media data
        })
        .filter(Boolean);

      const failed = results.filter(result => {
        if (result.status === 'rejected') return true;
        if (result.status === 'fulfilled') {
          const response = result.value;
          // Consider failed if no success and no data with id
          return !(response.success === true || (response.data && response.data.id));
        }
        return false;
      }).length;

      console.log('Upload summary:', { successful: successful.length, failed }); // Debug log

      if (successful.length > 0) {
        setState(prev => ({
          ...prev,
          items: [
            ...successful,
            ...prev.items
          ].slice(0, prev.pagination.pageSize), // Keep only pageSize items
          loading: 'success',
          pagination: {
            ...prev.pagination,
            totalCount: prev.pagination.totalCount + successful.length
          }
        }));

        // Refresh media list to get updated pagination
        await fetchMedia();
      }

      if (failed > 0 && successful.length === 0) {
        // Only show error if all uploads failed
        setState(prev => ({
          ...prev,
          loading: 'error',
          error: `All ${failed} file(s) failed to upload`
        }));
      } else if (failed > 0) {
        // Show warning if some failed
        setState(prev => ({
          ...prev,
          error: `${failed} file(s) failed to upload, ${successful.length} succeeded`
        }));
      }

      return { successful: successful.length, failed };
    } catch (error: any) {
      console.error('Upload error:', error);
      setState(prev => ({
        ...prev,
        loading: 'error',
        error: error.message || 'Upload failed'
      }));
      throw error;
    }
  }, [fetchMedia]);

  // =================================================================
  // UPDATE MEDIA
  // =================================================================

  const updateMedia = useCallback(async (id: string, updateData: UpdateMediaDto) => {
    try {
      const response = await mediaService.updateMedia(id, updateData);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === id ? response.data! : item
          )
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  // =================================================================
  // DELETE MEDIA
  // =================================================================

  const deleteMedia = useCallback(async (id: string) => {
    try {
      const response = await mediaService.deleteMedia(id);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id),
          selectedItems: prev.selectedItems.filter(item => item.id !== id),
          pagination: {
            ...prev.pagination,
            totalCount: prev.pagination.totalCount - 1
          }
        }));
        
        // Force refresh to ensure server state sync
        setTimeout(() => fetchMedia(state.filters, true), 100);
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [state.filters, fetchMedia]);

  // =================================================================
  // BULK DELETE
  // =================================================================

  const bulkDeleteMedia = useCallback(async (ids: string[]) => {
    try {
      const response = await mediaService.deleteMultipleMedia(ids);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => !ids.includes(item.id)),
          selectedItems: prev.selectedItems.filter(item => !ids.includes(item.id)),
          pagination: {
            ...prev.pagination,
            totalCount: prev.pagination.totalCount - (response.data?.deletedCount || 0)
          }
        }));
        
        // Force refresh to ensure server state sync
        setTimeout(() => fetchMedia(state.filters, true), 100);
        
        return response.data;
      } else {
        throw new Error(response.message || 'Bulk delete failed');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [state.filters, fetchMedia]);

  // =================================================================
  // SELECTION MANAGEMENT
  // =================================================================

  const selectMedia = useCallback((media: MediaDto | MediaDto[]) => {
    const items = Array.isArray(media) ? media : [media];
    setState(prev => ({
      ...prev,
      selectedItems: [...prev.selectedItems, ...items.filter(item => 
        !prev.selectedItems.some(selected => selected.id === item.id)
      )]
    }));
  }, []);

  const deselectMedia = useCallback((mediaId: string | string[]) => {
    const ids = Array.isArray(mediaId) ? mediaId : [mediaId];
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter(item => !ids.includes(item.id))
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItems: [] }));
  }, []);

  const toggleSelection = useCallback((media: MediaDto) => {
    setState(prev => {
      const isSelected = prev.selectedItems.some(item => item.id === media.id);
      if (isSelected) {
        return {
          ...prev,
          selectedItems: prev.selectedItems.filter(item => item.id !== media.id)
        };
      } else {
        return {
          ...prev,
          selectedItems: [...prev.selectedItems, media]
        };
      }
    });
  }, []);

  // =================================================================
  // PAGINATION & FILTERING
  // =================================================================

  const goToPage = useCallback((pageNumber: number) => {
    fetchMedia({ ...state.filters, pageNumber });
  }, [fetchMedia, state.filters]);

  const changePageSize = useCallback((pageSize: number) => {
    fetchMedia({ ...state.filters, pageSize, pageNumber: 1 });
  }, [fetchMedia, state.filters]);

  const applyFilters = useCallback((filters: Partial<MediaQueryParams>) => {
    fetchMedia({ ...state.filters, ...filters, pageNumber: 1 });
  }, [fetchMedia, state.filters]);

  const resetFilters = useCallback(() => {
    const defaultFilters = initialParams || {};
    setState(prev => ({ ...prev, filters: defaultFilters }));
    fetchMedia(defaultFilters);
  }, [fetchMedia, initialParams]);

  // =================================================================
  // INITIAL LOAD
  // =================================================================

  useEffect(() => {
    fetchMedia();
  }, []); // Only run on mount

  return {
    // State
    ...state,
    
    // Actions
    fetchMedia,
    uploadMedia,
    updateMedia,
    deleteMedia,
    bulkDeleteMedia,
    
    // Selection
    selectMedia,
    deselectMedia,
    clearSelection,
    toggleSelection,
    
    // Pagination & Filtering
    goToPage,
    changePageSize,
    applyFilters,
    resetFilters,
    
    // Utility
    refresh: () => fetchMedia(state.filters),
    forceRefresh: () => fetchMedia(state.filters, true)
  };
};

// =================================================================
// MEDIA ANALYTICS HOOK
// =================================================================

export const useMediaAnalytics = () => {
  const [analytics, setAnalytics] = useState<MediaAnalyticsDto | null>(null);
  const [loading, setLoading] = useState<MediaLoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading('loading');
    setError(null);

    try {
      const response = await mediaService.getAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
        setLoading('success');
      } else {
        setError(response.message || 'Failed to fetch analytics');
        setLoading('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading('error');
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics
  };
};

// =================================================================
// MEDIA SHARING HOOK
// =================================================================

export const useMediaSharing = () => {
  const [sharedMedia, setSharedMedia] = useState<MediaShareDto[]>([]);
  const [myShares, setMyShares] = useState<MediaShareDto[]>([]);
  const [loading, setLoading] = useState<MediaLoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchSharedMedia = useCallback(async () => {
    setLoading('loading');
    setError(null);

    try {
      const [sharedResponse, mySharesResponse] = await Promise.all([
        mediaService.getSharedMedia(),
        mediaService.getMediaSharedByMe()
      ]);

      if (sharedResponse.success && mySharesResponse.success) {
        setSharedMedia(sharedResponse.data || []);
        setMyShares(mySharesResponse.data || []);
        setLoading('success');
      } else {
        setError('Failed to fetch shared media');
        setLoading('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading('error');
    }
  }, []);

  const createShare = useCallback(async (mediaId: string, tenantId: string, options?: {
    expiresAt?: string;
    shareType?: string;
  }) => {
    try {
      const response = await mediaService.createMediaShare({
        mediaId,
        sharedWithTenantId: tenantId,
        ...options
      });

      if (response.success && response.data) {
        setMyShares(prev => [...prev, response.data!]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create share');
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, []);

  const revokeShare = useCallback(async (shareId: string) => {
    try {
      const response = await mediaService.revokeMediaShare(shareId);
      
      if (response.success) {
        setMyShares(prev => prev.filter(share => share.id !== shareId));
      } else {
        throw new Error(response.message || 'Failed to revoke share');
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchSharedMedia();
  }, []);

  return {
    sharedMedia,
    myShares,
    loading,
    error,
    createShare,
    revokeShare,
    refresh: fetchSharedMedia
  };
};

// =================================================================
// MEDIA USAGE TRACKING HOOK
// =================================================================

export const useMediaUsageTracking = () => {
  const trackingRef = useRef<Set<string>>(new Set());

  const trackMediaInContent = useCallback(async (postId: string, htmlContent: string) => {
    try {
      const mediaIds = mediaService.extractMediaIdsFromHtml(htmlContent);
      
      if (mediaIds.length > 0) {
        await mediaService.trackMediaInPost(postId, mediaIds);
        mediaIds.forEach(id => trackingRef.current.add(id));
      }
    } catch (error) {
      console.error('Failed to track media usage:', error);
    }
  }, []);

  const untrackMediaInContent = useCallback(async (postId: string, htmlContent: string) => {
    try {
      const mediaIds = mediaService.extractMediaIdsFromHtml(htmlContent);
      
      if (mediaIds.length > 0) {
        await mediaService.untrackMediaInPost(postId, mediaIds);
        mediaIds.forEach(id => trackingRef.current.delete(id));
      }
    } catch (error) {
      console.error('Failed to untrack media usage:', error);
    }
  }, []);

  const incrementUsage = useCallback(async (mediaId: string) => {
    try {
      await mediaService.incrementUsage(mediaId);
    } catch (error) {
      console.error('Failed to increment media usage:', error);
    }
  }, []);

  const decrementUsage = useCallback(async (mediaId: string) => {
    try {
      await mediaService.decrementUsage(mediaId);
    } catch (error) {
      console.error('Failed to decrement media usage:', error);
    }
  }, []);

  return {
    trackMediaInContent,
    untrackMediaInContent,
    incrementUsage,
    decrementUsage,
    trackedMedia: Array.from(trackingRef.current)
  };
};
