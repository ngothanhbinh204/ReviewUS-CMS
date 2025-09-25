import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { tenantService } from '../../services/tenantService';

const TenantSelector: React.FC = () => {
  const { currentTenant, availableTenants, switchTenant, isLoading } = useTenant();
  const { updateAccessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleTenantSelect = async (tenantId: string) => {
    try {
      console.log('Selecting tenant:', tenantId);
      
      // Use tenant service to select tenant and get new token
      const result = await tenantService.selectTenant(tenantId);
      
      console.log('Tenant selection result:', result);
      
      if (result.accessToken) {
        console.log('Updating access token:', result.accessToken);
        // Update accessToken in AuthContext and Local Storage
        updateAccessToken(result.accessToken);
        localStorage.setItem('token', result.accessToken);
      } else {
        console.warn('No access token returned from select tenant API');
      }

      // Update tenant context
      await switchTenant(tenantId);

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      // Don't close dropdown on error so user can try again
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-gray-500">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentTenant?.name || currentTenant?.slug || 'Select Tenant'}
            </div>
            {currentTenant?.domain && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentTenant.domain}
              </div>
            )}
          </div>
        </div>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="py-1">
            {availableTenants.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No tenants available
              </div>
            ) : (
              availableTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSelect(tenant.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentTenant?.id === tenant.id
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{tenant.name || tenant.slug}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tenant.domain}
                      </div>
                    </div>
                    {currentTenant?.id === tenant.id && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default TenantSelector;
