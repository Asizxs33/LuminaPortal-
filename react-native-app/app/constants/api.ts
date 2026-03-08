import { Platform } from 'react-native';

const envApi = process.env.EXPO_PUBLIC_API_URL;

const isWeb = Platform.OS === 'web';
const isLocalhost =
  isWeb && typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API: string =
  envApi ??
  (isWeb && !isLocalhost ? '' : 'http://172.20.10.2:3001');
