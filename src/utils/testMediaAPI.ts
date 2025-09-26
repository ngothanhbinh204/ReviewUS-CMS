// Simple test to check API connectivity
export const testMediaAPI = async () => {
  console.log('🧪 Testing Media API connectivity...');
  
  // Test 1: Check if API endpoint exists
  console.log('1️⃣ Testing basic API endpoint...');
  try {
    const response = await fetch('/media', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Basic fetch status:', response.status);
    console.log('Basic fetch ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Basic fetch data:', data);
    } else {
      const errorText = await response.text();
      console.log('Basic fetch error:', errorText);
    }
  } catch (error) {
    console.error('Basic fetch failed:', error);
  }

  // Test 2: Test with auth headers (if token exists)
  console.log('2️⃣ Testing with auth headers...');
  try {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('current_tenant_id');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using token:', token.substring(0, 20) + '...');
    }
    
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
      console.log('Using tenant ID:', tenantId);
    }
    
    const response = await fetch('/media?pageNumber=1&pageSize=5', {
      method: 'GET',
      headers
    });
    
    console.log('Auth fetch status:', response.status);
    console.log('Auth fetch ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Auth fetch data:', data);
      console.log('Data structure check:');
      console.log('- has success:', 'success' in data);
      console.log('- has data:', 'data' in data);
      console.log('- data is array:', Array.isArray(data.data));
      console.log('- data length:', data.data?.length);
    } else {
      const errorText = await response.text();
      console.log('Auth fetch error:', errorText);
    }
  } catch (error) {
    console.error('Auth fetch failed:', error);
  }

  // Test 3: Test upload endpoint
  console.log('3️⃣ Testing upload endpoint (HEAD request)...');
  try {
    const response = await fetch('/media/upload', {
      method: 'HEAD'
    });
    console.log('Upload endpoint status:', response.status);
  } catch (error) {
    console.error('Upload endpoint test failed:', error);
  }
};

// Auto-run in dev mode
if (import.meta.env.DEV) {
  // Wait a bit for app to initialize
  setTimeout(() => {
    testMediaAPI();
  }, 2000);
}