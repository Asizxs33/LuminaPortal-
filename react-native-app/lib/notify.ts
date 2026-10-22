import { Alert } from 'react-native';

export const notify = {
  success: (message: string) => Alert.alert('Дайын', message),
  error: (message: string) => Alert.alert('Қате', message),
  info: (message: string) => Alert.alert('Ақпарат', message),
};
