import React, { useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { tenantService } from '../../services/tenantService';

interface TenantInitializerProps {
  children: React.ReactNode;
}

const TenantInitializer: React.FC<TenantInitializerProps> = ({ children }) => {
  const { currentTenant, availableTenants, isLoading } = useTenant();

  useEffect(() => {
    const initializeTenant = async () => {
      // If no current tenant is selected and we have available tenants
      if (!currentTenant && availableTenants.length > 0 && !isLoading) {
        try {
          // Select the first available tenant
          const firstTenant = availableTenants[0];
          tenantService.setCurrentTenant(firstTenant);
          
          // Don't reload here, let the context handle the state update
          console.log('Auto-selected first available tenant:', firstTenant.slug);
        } catch (error) {
          console.error('Failed to auto-select tenant:', error);
        }
      }
    };

    initializeTenant();
  }, [currentTenant, availableTenants, isLoading]);

  return <>{children}</>;
};

export default TenantInitializer;
