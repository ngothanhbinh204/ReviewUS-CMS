import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, tenantService } from '../services/tenantService';
import { useAuth } from './AuthContext';

interface TenantContextType {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tenant data on mount
  const { isLoading: authLoading } = useAuth();

  // Load tenant data after auth has initialized
  useEffect(() => {
    if (!authLoading) {
      initializeTenants();
    }
    // We only want to run when authLoading becomes false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const initializeTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load current tenant from localStorage
      const storedTenant = tenantService.getCurrentTenant();
      setCurrentTenant(storedTenant);

      // Load available tenants
      await refreshTenants();
    } catch (error) {
      console.error('Failed to initialize tenants:', error);
      setError('Failed to load tenant information');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenants = async () => {
    try {
      const tenants = await tenantService.getAvailableTenants();
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('Failed to refresh tenants:', error);
      setError('Failed to load available tenants');
      throw error;
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tenant = availableTenants.find(t => t.id === tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      tenantService.setCurrentTenant(tenant);
      setCurrentTenant(tenant);

      // Reload page to apply new tenant context
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      setError('Failed to switch tenant');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        availableTenants,
        isLoading,
        error,
        switchTenant,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
