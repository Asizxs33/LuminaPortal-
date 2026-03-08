import { Platform } from 'react-native';

// Priority:
// 1. EXPO_PUBLIC_API_URL env variable (set this in EAS secrets or .env for production APK)
// 2. Web on production (relative URL — same Vercel domain)
// 3. Dev fallback (local machine IP for Expo Go on same WiFi)

const envApi = process.env.EXPO_PUBLIC_API_URL;

const isWeb = Platform.OS === 'web';
const isLocalhost =
  isWeb && typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API: string =
  envApi ??
  (isWeb && !isLocalhost ? '' : 'http://172.20.10.2:3001');
