import { apiClient } from './api';

export interface Tenant {
  id: string;
  slug: string;
  domain: string;
  createdAt: string;
  name?: string;
  settings?: any;
}

export interface TenantResponse {
  success: boolean;
  message: string;
  data: Tenant[];
  errors: any;
  timestamp: string;
}

class TenantService {
  // Get all available tenants (my tenants)
  async getAvailableTenants(): Promise<Tenant[]> {
    try {
      const response = await apiClient.get<TenantResponse>('TenantSelector/my-tenants');
      if (response.data.success) {
        console.log('Fetched tenants:', response.data.data);
        return response.data.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      throw error;
    }
  }

  // Get current tenant from API
  async getCurrentTenantFromAPI(): Promise<Tenant | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Tenant }>('TenantSelector/current-tenant');
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch current tenant:', error);
      return null;
    }
  }

  // Select tenant and get new token
  async selectTenant(tenantId: string): Promise<{ tenant: Tenant; accessToken?: string }> {
    try {
      const response = await apiClient.post('TenantSelector/select-tenant', { tenantId });
      
      console.log('Select tenant API response:', response.data);
      
      // Handle different response structures
      let responseData = response.data;
      
      // If response has a 'data' property, use that
      if (responseData.data) {
        responseData = responseData.data;
      }
      
      // Extract tenant and token information
      const tenant = responseData.tenant;
      const newToken = responseData.accessToken || responseData.token;
      
      console.log('Extracted tenant:', tenant);
      console.log('Extracted token:', newToken);
      
      if (tenant && tenant.id) {
        // Update localStorage with new tenant info
        this.setCurrentTenant(tenant);
      } else {
        console.warn('Tenant information not found in response, using tenantId to create minimal tenant');
        // Create minimal tenant object if not provided
        const minimalTenant: Tenant = {
          id: tenantId,
          slug: '',
          domain: '',
          createdAt: new Date().toISOString()
        };
        this.setCurrentTenant(minimalTenant);
      }
      
      return { 
        tenant: tenant || { id: tenantId, slug: '', domain: '', createdAt: new Date().toISOString() }, 
        accessToken: newToken 
      };
      
    } catch (error: any) {
      console.error('Failed to select tenant:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  // Set current tenant
  setCurrentTenant(tenant: Tenant) {
    localStorage.setItem('current_tenant_id', tenant.id);
    localStorage.setItem('current_tenant_slug', tenant.slug);
    localStorage.setItem('current_tenant', JSON.stringify(tenant));
  }

  // Get current tenant from localStorage
  getCurrentTenant(): Tenant | null {
    try {
      const tenantData = localStorage.getItem('current_tenant');
      return tenantData ? JSON.parse(tenantData) : null;
    } catch {
      return null;
    }
  }

  // Get current tenant ID
  getCurrentTenantId(): string | null {
    return localStorage.getItem('current_tenant_id');
  }

  // Get current tenant slug
  getCurrentTenantSlug(): string | null {
    return localStorage.getItem('current_tenant_slug');
  }

  // Clear tenant data
  clearCurrentTenant() {
    localStorage.removeItem('current_tenant_id');
    localStorage.removeItem('current_tenant_slug');
    localStorage.removeItem('current_tenant');
  }

  // Check if tenant is set
  hasTenant(): boolean {
    return this.getCurrentTenantId() !== null;
  }

  // Switch tenant
  async switchTenant(tenantId: string): Promise<void> {
    try {
      const result = await this.selectTenant(tenantId);
      
      // If we got a new token, it should be handled by the calling component
      // The tenant info is already saved in selectTenant method
      
      console.log('Tenant switched successfully:', result.tenant);
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      throw error;
    }
  }
}

export const tenantService = new TenantService();
