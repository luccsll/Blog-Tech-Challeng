import { isAxiosError, isCancel } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { PostForm } from '@/components/post-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPost, updatePost, type Post, type PostInput } from '@/services/posts';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getPost(id, controller.signal)
      .then(setPost)
      .catch((e) => {
        if (isCancel(e)) return;
        setError(
          isAxiosError(e) && e.response?.status === 404
            ? 'Post não encontrado.'
            : 'Não foi possível carregar o post.'
        );
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  function reload() {
    setError(null);
    setReloadKey((key) => key + 1);
  }

  async function handleSubmit(values: PostInput) {
    await updatePost(id, values);
    router.back();
  }

  if (error) {
    return (
      <ThemedView style={styles.feedback}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable accessibilityRole="button" onPress={reload}>
          <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!post) {
    return (
      <ThemedView style={styles.feedback}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  return <PostForm initialValues={post} submitLabel="Salvar alterações" onSubmit={handleSubmit} />;
}

const styles = StyleSheet.create({
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
});
