// Auto-detect API URL for development
export function getApiUrl(): string {
  // Use env variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development auto-detection
  if (import.meta.env.DEV) {
    // Try to detect if we're running on network
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    } else {
      // If frontend is accessed via IP, assume backend is on same network
      const baseIP = hostname.split('.').slice(0, 3).join('.');
      return `http://${baseIP}.1:5000/api`; // Assuming backend is on .1
    }
  }
  
  // Production fallback
  return 'https://api.reviewus.com/api';
}

export const API_BASE_URL = getApiUrl();

console.log('Using API URL:', API_BASE_URL);
