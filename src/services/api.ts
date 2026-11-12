import axios, { isAxiosError } from 'axios';

// On a physical device, localhost is the device itself: use the computer's LAN IP.
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://SEU_IP:3001',
  timeout: 10000,
});

let handleUnauthorized: (() => void) | null = null;

// A 401 on a request that carried the token means the session expired (the API issues 8h tokens).
api.interceptors.response.use(undefined, (error) => {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers.has('Authorization')
  ) {
    handleUnauthorized?.();
  }
  return Promise.reject(error);
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  handleUnauthorized = handler;
}

/** Message the API sent with an error response, if any. */
export function getApiMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message;
  }
}

export type User = {
  id: string;
  name: string;
  username: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
  return data;
}
