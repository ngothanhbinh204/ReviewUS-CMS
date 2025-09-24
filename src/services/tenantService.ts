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
  // Get all available tenants
  async getAvailableTenants(): Promise<Tenant[]> {
    try {
      const response = await apiClient.get<TenantResponse>('Test/tenants');
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
      const tenants = await this.getAvailableTenants();
      const tenant = tenants.find(t => t.id === tenantId);
      
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      this.setCurrentTenant(tenant);
      
      // Refresh the page to apply new tenant context
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      throw error;
    }
  }
}

export const tenantService = new TenantService();
