import axios from 'axios';

// On a physical device, localhost is the device itself: use the computer's LAN IP.
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://SEU_IP:3001',
  timeout: 10000,
});

// Replace with the fields the API returns in `user`.
export type User = Record<string, unknown>;

type LoginResponse = {
  token: string;
  user: User;
};

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
  return data;
}
