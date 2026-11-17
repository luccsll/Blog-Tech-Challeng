// Alert.alert does nothing on react-native-web.
export function showError(message: string) {
  window.alert(message);
}
