// expo-secure-store is not available on web. localStorage is readable by any
// script on the page, so it does not offer the same protection as the native store.
export async function getItem(key: string) {
  return localStorage.getItem(key);
}

export async function setItem(key: string, value: string) {
  localStorage.setItem(key, value);
}

export async function deleteItem(key: string) {
  localStorage.removeItem(key);
}
