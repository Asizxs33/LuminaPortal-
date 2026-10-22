import { Platform } from 'react-native';

// Shared display face for the academic identity. Body text remains sans-serif.
export const displayFont = Platform.OS === 'web' ? 'Georgia, Times New Roman, serif' : 'serif';
