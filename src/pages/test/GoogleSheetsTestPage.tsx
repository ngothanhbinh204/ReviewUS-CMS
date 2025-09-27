import React from 'react';
import GoogleSheetsTestComponent from '../../components/test/GoogleSheetsTestComponent';

const GoogleSheetsTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Sheets API Test</h1>
          <p className="text-gray-600 mt-2">
            Test connection to Google Sheets and verify data import
          </p>
        </div>
        
        <GoogleSheetsTestComponent />
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">1. Google Sheets API Setup</h3>
              <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside">
                <li>Go to <a href="https://console.developers.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Enable Google Sheets API for your project</li>
                <li>Create API Key (or use existing one)</li>
                <li>Make sure your Google Sheet is publicly readable</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. Google Sheet Permissions</h3>
              <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside">
                <li>Open your Google Sheet</li>
                <li>Click "Share" button</li>
                <li>Change permissions to "Anyone with the link can view"</li>
                <li>Or add your service account email if using service account</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">3. Expected Sheet Format</h3>
              <div className="mt-2 bg-gray-100 p-3 rounded text-xs font-mono">
                <div>Column A: outline</div>
                <div>Column B: meta_title</div>
                <div>Column C: meta_description</div>
                <div>Column D: keyword</div>
                <div>Column E: STATUS (ready/pending/created/generating/error)</div>
                <div>Column F: Content</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsTestPage;