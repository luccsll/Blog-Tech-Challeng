// Alert.alert does nothing on web, so the browser dialog is used instead.
export async function confirm(title: string, message: string, _confirmLabel: string) {
  return window.confirm(`${title}\n\n${message}`);
}
