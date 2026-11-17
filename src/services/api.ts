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

export const FORBIDDEN_MESSAGE = 'Você não tem permissão para esta ação.';

/** Message to show for a failed request: the API's own message, if it sent one. */
export function getApiMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    // 403 means a logged-in aluno tried a professor-only action.
    if (error.response?.status === 403) return FORBIDDEN_MESSAGE;
    return error.response?.data?.message;
  }
}

export type Role = 'professor' | 'aluno';

export type User = {
  id: string;
  nome: string;
  username: string;
  email: string;
  role: Role;
};

type LoginResponse = {
  token: string;
  user: User;
};

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
  return data;
}
