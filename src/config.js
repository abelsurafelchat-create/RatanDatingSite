// API Configuration
export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://api.yourdomain.com'
  : 'http://localhost:3001';

export const SOCKET_URL = import.meta.env.PROD
  ? import.meta.env.VITE_SOCKET_URL || 'https://api.yourdomain.com'
  : 'http://localhost:3001';

export const IS_PRODUCTION = import.meta.env.PROD;

console.log('Environment:', IS_PRODUCTION ? 'Production' : 'Development');
console.log('API URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);
