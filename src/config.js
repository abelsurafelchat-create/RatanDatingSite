// API Configuration
// Get the current window location for production or use localhost for development
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // In browser environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    } else {
      // Use current domain and port (same as the webpage)
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  // Fallback for server-side rendering
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const API_URL = getBaseURL();
export const SOCKET_URL = getBaseURL();

export const IS_PRODUCTION = import.meta.env.PROD;

console.log('🔧 Configuration loaded:');
console.log('Environment:', IS_PRODUCTION ? 'Production' : 'Development');
console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
console.log('Current protocol:', typeof window !== 'undefined' ? window.location.protocol : 'SSR');
console.log('API URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);
