import React, { useState } from 'react';
import { Download, AlertTriangle, CheckCircle } from 'lucide-react';
import postLayoutService from '../../services/postLayoutService';
import { PostLayoutData } from '../../types/postLayout.types';

const GoogleSheetsTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PostLayoutData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testGoogleSheetsImport = async () => {
    setIsLoading(true);
    setError(null);
    setData([]);
    
    try {
      console.log('Testing Google Sheets import...');
      const importedData = await postLayoutService.importFromGoogleSheets();
      setData(importedData);
      console.log('Import successful:', importedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Import failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Google Sheets API Test</h2>
      
      <div className="mb-4">
        <button
          onClick={testGoogleSheetsImport}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Testing...' : 'Test Google Sheets Import'}
        </button>
      </div>

      {/* Environment Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <p><strong>API URL:</strong> {import.meta.env.VITE_GOOGLE_SHEETS_API_URL || 'Not set'}</p>
        <p><strong>API Key:</strong> {import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ? '✓ Set' : '✗ Missing'}</p>
        <p><strong>Sheet ID:</strong> {import.meta.env.VITE_GOOGLE_SHEET_ID || 'Not set'}</p>
        <p><strong>Range:</strong> {import.meta.env.VITE_GOOGLE_SHEET_RANGE || 'Not set'}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Import Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {data.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-green-800 font-medium">Import Successful!</h3>
          </div>
          <p className="text-green-700 text-sm">Found {data.length} rows in Google Sheets</p>
        </div>
      )}

      {/* Data Preview */}
      {data.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Preview Data:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left">Outline</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Meta Title</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Keyword</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 text-sm max-w-xs truncate">
                      {item.outline}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm max-w-xs truncate">
                      {item.meta_title}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {item.keyword}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'ready' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 5 rows of {data.length} total rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">Debug Information</summary>
        <pre className="mt-2 p-3 bg-gray-100 text-xs overflow-auto rounded">
          {JSON.stringify({
            env: {
              VITE_GOOGLE_SHEETS_API_URL: import.meta.env.VITE_GOOGLE_SHEETS_API_URL,
              VITE_GOOGLE_SHEETS_API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ? '[HIDDEN]' : 'Not set',
              VITE_GOOGLE_SHEET_ID: import.meta.env.VITE_GOOGLE_SHEET_ID,
              VITE_GOOGLE_SHEET_RANGE: import.meta.env.VITE_GOOGLE_SHEET_RANGE,
            },
            dataCount: data.length,
            error: error,
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default GoogleSheetsTestComponent;