import { api } from '@/services/api';

export type Post = {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string;
  createdAt: string;
};

export async function getPosts(query: string, signal?: AbortSignal) {
  const { data } = await api.get<Post[]>('/posts', {
    params: query ? { q: query } : undefined,
    signal,
  });
  return data;
}

export async function getPost(id: string, signal?: AbortSignal) {
  const { data } = await api.get<Post>(`/posts/${id}`, { signal });
  return data;
}
