import React, { useState } from 'react';
import { mediaService } from '../../services/mediaService';

export const MediaDebugComponent: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testFetchMedia = async () => {
    setLoading(true);
    try {
      console.log('Testing media fetch...');
      const response = await mediaService.getMedia({
        pageNumber: 1,
        pageSize: 10,
        mimeType: 'image/*'
      });
      
      console.log('Raw API Response:', response);
      setDebugInfo({
        type: 'fetch',
        response: JSON.stringify(response, null, 2),
        success: response.success,
        hasData: !!response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setDebugInfo({
        type: 'fetch',
        error: error.message,
        fullError: JSON.stringify(error, null, 2)
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    // Create a dummy file for testing
    const dummyFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    setLoading(true);
    try {
      console.log('Testing upload...');
      const response = await mediaService.uploadMedia({
        file: dummyFile,
        alt: 'Test upload',
        title: 'Debug test file'
      });
      
      console.log('Upload response:', response);
      setDebugInfo({
        type: 'upload',
        response: JSON.stringify(response, null, 2),
        success: response.success,
        hasData: !!response.data
      });
    } catch (error) {
      console.error('Upload error:', error);
      setDebugInfo({
        type: 'upload',
        error: error.message,
        fullError: JSON.stringify(error, null, 2)
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPICall = async () => {
    setLoading(true);
    try {
      console.log('Testing direct API call...');
      const response = await fetch('/media?pageNumber=1&pageSize=10');
      const data = await response.json();
      
      console.log('Direct API response:', { status: response.status, data });
      setDebugInfo({
        type: 'direct',
        status: response.status,
        ok: response.ok,
        response: JSON.stringify(data, null, 2)
      });
    } catch (error) {
      console.error('Direct API error:', error);
      setDebugInfo({
        type: 'direct',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🐛 Media API Debug Tool</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testFetchMedia}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Fetch Media
        </button>
        
        <button
          onClick={testUpload}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Upload
        </button>
        
        <button
          onClick={testDirectAPICall}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Direct API
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2">Testing...</p>
        </div>
      )}

      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Debug Results ({debugInfo.type})</h3>
          
          {debugInfo.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="text-red-800 font-medium">Error:</h4>
              <p className="text-red-600">{debugInfo.error}</p>
            </div>
          )}

          <div className="space-y-3">
            {debugInfo.success !== undefined && (
              <div>
                <strong>Success:</strong> 
                <span className={debugInfo.success ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.success ? ' ✅ True' : ' ❌ False'}
                </span>
              </div>
            )}

            {debugInfo.hasData !== undefined && (
              <div>
                <strong>Has Data:</strong> 
                <span className={debugInfo.hasData ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.hasData ? ' ✅ Yes' : ' ❌ No'}
                </span>
              </div>
            )}

            {debugInfo.dataLength !== undefined && (
              <div>
                <strong>Data Length:</strong> {debugInfo.dataLength}
              </div>
            )}

            {debugInfo.status && (
              <div>
                <strong>HTTP Status:</strong> {debugInfo.status}
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Full Response</summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                {debugInfo.response || debugInfo.fullError}
              </pre>
            </details>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Expected API Response Format:</h3>
        <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://storage.googleapis.com/...",
      "alt": "Alt text",
      "meta": { "title": "..." },
      "dimensions": { "width": 1920, "height": 1080 }
    }
  ],
  "pageNumber": 1,
  "totalPages": 1,
  "totalCount": 5,
  "pageSize": 20
}`}
        </pre>
      </div>
    </div>
  );
};

export default MediaDebugComponent;