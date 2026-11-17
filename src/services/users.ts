import { api, type Role, type User } from '@/services/api';

// Professores and alunos share the same API shape, only the base path changes.
const PATHS: Record<Role, string> = {
  professor: '/professores',
  aluno: '/alunos',
};

export const PAGE_SIZE = 10;

export type UserInput = {
  nome: string;
  username: string;
  email: string;
  /** Required to create; on update an empty value keeps the current password. */
  senha: string;
};

export type Page<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getUsers(role: Role, page: number, signal?: AbortSignal) {
  const { data } = await api.get<Page<User>>(PATHS[role], {
    params: { page, limit: PAGE_SIZE },
    signal,
  });
  return data;
}

export async function getUser(role: Role, id: string, signal?: AbortSignal) {
  const { data } = await api.get<User>(`${PATHS[role]}/${id}`, { signal });
  return data;
}

export async function createUser(role: Role, input: UserInput) {
  const { data } = await api.post<User>(PATHS[role], input);
  return data;
}

export async function updateUser(role: Role, id: string, { senha, ...input }: UserInput) {
  const { data } = await api.put<User>(`${PATHS[role]}/${id}`, senha ? { ...input, senha } : input);
  return data;
}

export async function deleteUser(role: Role, id: string) {
  await api.delete(`${PATHS[role]}/${id}`);
}
