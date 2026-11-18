import { isAxiosError, isCancel } from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPost, type Post } from '@/services/posts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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

  return (
    <ScrollView
      // The iOS header is translucent and sits over the screen: this pushes the content below it.
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.four }]}>
      <View style={styles.article}>
        <ThemedText type="subtitle">{post.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {post.author} · {formatDate(post.createdAt)}
        </ThemedText>
        <ThemedText style={styles.content}>{post.content}</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  article: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  content: {
    marginTop: Spacing.three,
    lineHeight: 26,
  },
});
