import { isCancel } from 'axios';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiMessage } from '@/services/api';
import { deletePost, getPosts, type Post } from '@/services/posts';
import { showError } from '@/utils/alert';
import { confirm } from '@/utils/confirm';

type Status = 'loading' | 'ready' | 'error';

export default function AdminPostsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      setPosts(await getPosts('', controller.signal));
      setStatus('ready');
    } catch (e) {
      if (isCancel(e)) return;
      setStatus('error');
    }
  }, []);

  // Reloads whenever the screen regains focus, e.g. after creating or editing a post.
  useFocusEffect(
    useCallback(() => {
      load();
      return () => requestRef.current?.abort();
    }, [load])
  );

  function reload() {
    setStatus('loading');
    load();
  }

  async function handleDelete(post: Post) {
    const confirmed = await confirm(
      'Excluir post',
      `Tem certeza que deseja excluir "${post.title}"? Essa ação não pode ser desfeita.`,
      'Excluir'
    );
    if (!confirmed) return;

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      setPosts((current) => current.filter((p) => p.id !== post.id));
    } catch (e) {
      showError(getApiMessage(e) ?? 'Não foi possível excluir o post. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  }

  if (status === 'loading') {
    return (
      <ThemedView style={styles.feedback}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  if (status === 'error') {
    return (
      <ThemedView style={styles.feedback}>
        <ThemedText themeColor="textSecondary">Não foi possível carregar os posts.</ThemedText>
        <Pressable accessibilityRole="button" onPress={reload}>
          <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <FlatList
      // The iOS header is translucent and sits over the screen: this pushes the content below it.
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      data={posts}
      keyExtractor={(post) => post.id}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.four }]}
      ListHeaderComponent={
        <Link href="/posts/new" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.text },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={{ color: theme.background }}>Novo post</ThemedText>
          </Pressable>
        </Link>
      }
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum post publicado ainda.
        </ThemedText>
      }
      renderItem={({ item }) => {
        const isDeleting = deletingId === item.id;

        return (
          <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.author}
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Link href={{ pathname: '/posts/[id]/edit', params: { id: item.id } }} asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.title}`}
                  disabled={isDeleting}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.backgroundSelected },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="small">Editar</ThemedText>
                </Pressable>
              </Link>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Excluir ${item.title}`}
                disabled={isDeleting}
                onPress={() => handleDelete(item)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  (pressed || isDeleting) && styles.pressed,
                ]}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ThemedText type="small" style={styles.deleteLabel}>
                    Excluir
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        );
      }}
    />
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
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: Spacing.two,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  row: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: {
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    minHeight: 40,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  deleteButton: {
    backgroundColor: '#E5484D',
  },
  deleteLabel: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
});
