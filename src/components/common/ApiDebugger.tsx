import React, { useState } from 'react';
import { apiClient } from '../../services/api';
import { postsApi } from '../../services/cmsApi';
import { tenantService } from '../../services/tenantService';
import { useAuth } from '../../context/AuthContext';

const ApiDebugger: React.FC = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, result: any, error?: any) => {
    setResults(prev => [...prev, {
      test,
      success: !error,
      result: error || result,
      timestamp: new Date().toISOString()
    }]);
  };

  const testConnection = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Test 1: Basic API connection
      const response = await apiClient.get('/Test/tenants');
      addResult('Basic API Connection', response.data);
    } catch (error: any) {
      addResult('Basic API Connection', null, error.response?.data || error.message);
    }

    // Test 2: Current tenant info
    const currentTenant = tenantService.getCurrentTenant();
    addResult('Current Tenant', currentTenant);

    // Test 3: Headers check
    const token = localStorage.getItem('token');
    
    // Decode JWT token for additional info
    let tokenInfo = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        tokenInfo = {
          userId: payload.sub,
          email: payload.email,
          tenantId: payload.tenantId,
          displayName: payload.displayName,
          permissions: payload.permission || [],
          exp: new Date(payload.exp * 1000).toLocaleString()
        };
      } catch (e) {
        tokenInfo = { error: 'Failed to decode JWT' };
      }
    }
    
    addResult('Auth Headers', {
      hasToken: !!token,
      tokenInfo,
      currentUser: user ? { 
        id: user.id, 
        email: user.email, 
        displayName: user.displayName,
        currentTenantId: user.current_tenant_id 
      } : null
    });

    // Test 4: Posts API call
    if (user && user.current_tenant_id) {
      try {
        const postsResponse = await postsApi.getAll({ pageNumber: 1, pageSize: 5 });
        addResult('Posts API Call', postsResponse);
      } catch (error: any) {
        addResult('Posts API Call', null, error.response?.data || error.message);
      }
    } else {
      addResult('Posts API Call', null, `No user or tenant - user: ${!!user}, tenantId: ${user?.current_tenant_id || 'none'}`);
    }

    setTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          API Debugger
        </h3>
        <div className="space-x-2">
          <button
            onClick={testConnection}
            disabled={testing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded text-sm font-medium"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className={`p-3 rounded border ${
              result.success 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-medium ${
                  result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {result.test}
                </h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  result.success 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <pre className={`text-xs overflow-x-auto ${
                result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {JSON.stringify(result.result, null, 2)}
              </pre>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Click "Test Connection" to run API diagnostics
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
