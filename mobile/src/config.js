import { Platform } from 'react-native';

// API Configuration for React Native
const getBaseURL = () => {
  if (__DEV__) {
    // Development - use your local IP address or localhost
    // For Android emulator, use 10.0.2.2
    // For iOS simulator, use localhost
    // For physical device, use your computer's IP address
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001'; // Android emulator
    } else {
      return 'http://localhost:3001'; // iOS simulator
    }
  } else {
    // Production - use your deployed server URL
    return 'https://your-production-domain.com';
  }
};

export const API_URL = getBaseURL();
export const SOCKET_URL = getBaseURL();

export const IS_PRODUCTION = !__DEV__;

console.log('🔧 Mobile Configuration loaded:');
console.log('Platform:', Platform.OS);
console.log('Environment:', IS_PRODUCTION ? 'Production' : 'Development');
console.log('API URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);
