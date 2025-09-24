import { useState } from 'react';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';

export default function ApiTestButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testApiConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('Testing API connection to:', apiClient.defaults.baseURL);
      
      // Test basic connection first
      const response = await apiClient.get('/health', { timeout: 5000 });
      
      setResult({
        success: true,
        data: response.data,
        status: response.status
      });
      
      toast.success('API connection successful!');
    } catch (error: any) {
      console.error('API test failed:', error);
      
      let errorInfo = {
        success: false,
        message: 'Unknown error',
        status: null,
        data: null
      };
      
      if (error.response) {
        errorInfo = {
          success: false,
          message: `Server error: ${error.response.status}`,
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        errorInfo = {
          success: false,
          message: 'No response from server',
          status: null,
          data: null
        };
      } else {
        errorInfo = {
          success: false,
          message: error.message,
          status: null,
          data: null
        };
      }
      
      setResult(errorInfo);
      toast.error(errorInfo.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-3">API Connection Test</h3>
      
      <div className="space-y-3">
        <div className="text-sm">
          <strong>API URL:</strong> {apiClient.defaults.baseURL}
        </div>
        
        <button
          onClick={testApiConnection}
          disabled={testing}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          {testing ? 'Testing...' : 'Test API Connection'}
        </button>
        
        {result && (
          <div className={`p-3 rounded-lg ${result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <div className="text-sm">
              <div><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</div>
              {result.status && <div><strong>Status:</strong> {result.status}</div>}
              <div><strong>Message:</strong> {result.message || 'Connection successful'}</div>
              {result.data && (
                <div className="mt-2">
                  <strong>Response:</strong>
                  <pre className="text-xs mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
