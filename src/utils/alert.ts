import { Alert } from 'react-native';

export function showError(message: string) {
  Alert.alert('Erro', message);
}
