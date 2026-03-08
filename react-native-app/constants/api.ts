import { Platform } from 'react-native';

// On web in production/staging: use relative URL (same Vercel domain hosts both frontend + API).
// On native (iOS/Android) dev: use the local dev server IP.
const isWeb = Platform.OS === 'web';
const isLocalhost =
  isWeb && typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Production web: '' means all fetch calls go to the same domain (https://luminaportal-edu.vercel.app)
// Local web dev: still use localhost relative path
// Native: use the direct local IP
export const API: string = isWeb && !isLocalhost ? '' : 'http://172.20.10.2:3001';
