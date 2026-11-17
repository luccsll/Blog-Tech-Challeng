import { router } from 'expo-router';

import { PostForm } from '@/components/post-form';
import { useAuth } from '@/contexts/auth-context';
import { createPost, type PostInput } from '@/services/posts';

export default function NewPostScreen() {
  const { user } = useAuth();

  async function handleSubmit(values: PostInput) {
    await createPost(values);
    router.back();
  }

  return (
    <PostForm
      initialValues={{ title: '', author: user?.nome ?? '', description: '', content: '' }}
      submitLabel="Publicar"
      onSubmit={handleSubmit}
    />
  );
}
