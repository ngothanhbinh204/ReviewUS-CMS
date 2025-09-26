import { apiClient } from './api';
import { ApiResponse, PagedApiResponse } from '../types/api.types';
import {
  DestinationDto,
  CreateDestinationDto,
  UpdateDestinationDto,
  DestinationListDto,
  DestinationQueryParams,
  DestinationSearchDto
} from '../types/destination.types';

class DestinationService {
  private baseUrl = '/Destinations';

  // 📋 LIST OPERATIONS
  async getDestinations(params?: DestinationQueryParams): Promise<PagedApiResponse<DestinationListDto>> {
    const response = await apiClient.get<PagedApiResponse<DestinationListDto>>(this.baseUrl, { params });
    return response.data;
  }

  async getDestinationsFresh(params?: DestinationQueryParams): Promise<PagedApiResponse<DestinationListDto>> {
    const response = await apiClient.get<PagedApiResponse<DestinationListDto>>(this.baseUrl, { 
      params: { ...params, _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Force-Refresh': 'true'
      }
    });
    return response.data;
  }

  // 📝 CRUD OPERATIONS
  async getDestination(id: string, options?: { forceRefresh?: boolean }): Promise<ApiResponse<DestinationDto>> {
    const config: any = {};
    
    if (options?.forceRefresh) {
      config.headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Force-Refresh': 'true'
      };
      config.params = {
        _t: Date.now(),
        _refresh: 'true'
      };
    }
    
    const response = await apiClient.get<ApiResponse<DestinationDto>>(`${this.baseUrl}/${id}`, config);
    return response.data;
  }

  async getDestinationBySlug(slug: string): Promise<ApiResponse<DestinationDto>> {
    const response = await apiClient.get<ApiResponse<DestinationDto>>(`${this.baseUrl}/slug/${slug}`);
    return response.data;
  }

  async createDestination(data: CreateDestinationDto): Promise<ApiResponse<DestinationDto>> {
    const response = await apiClient.post<ApiResponse<DestinationDto>>(this.baseUrl, data);
    return response.data;
  }

  async updateDestination(id: string, data: UpdateDestinationDto): Promise<ApiResponse<DestinationDto>> {
    const response = await apiClient.put<ApiResponse<DestinationDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteDestination(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // ️ UTILITY FUNCTIONS
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  validateDestination(destination: CreateDestinationDto): string[] {
    const errors: string[] = [];

    if (!destination.name || destination.name.trim() === '') {
      errors.push('Destination name is required');
    }

    if (destination.name && destination.name.trim().length < 2) {
      errors.push('Destination name must be at least 2 characters long');
    }

    if (destination.name && destination.name.trim().length > 200) {
      errors.push('Destination name must not exceed 200 characters');
    }

    // Validate coordinates if provided
    if (destination.latitude !== undefined && destination.latitude !== null) {
      if (destination.latitude < -90 || destination.latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }

    if (destination.longitude !== undefined && destination.longitude !== null) {
      if (destination.longitude < -180 || destination.longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    return errors;
  }

  // 🔍 SEARCH OPERATIONS
  async searchDestinations(searchParams: DestinationSearchDto): Promise<PagedApiResponse<DestinationListDto>> {
    const response = await apiClient.get<PagedApiResponse<DestinationListDto>>(`${this.baseUrl}/search`, { 
      params: searchParams 
    });
    return response.data;
  }
}

export const destinationService = new DestinationService();
export default destinationService;
