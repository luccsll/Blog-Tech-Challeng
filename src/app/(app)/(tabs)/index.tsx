import { isCancel } from 'axios';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { getPosts, type Post } from '@/services/posts';

const SEARCH_DELAY = 250;

type Status = 'loading' | 'ready' | 'error';

export default function PostsScreen() {
  const { logout } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const search = query.trim();

  // Each load aborts the previous one, so a slow response from an older search is dropped.
  const load = useCallback(async (term: string) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      setPosts(await getPosts(term, controller.signal));
      setStatus('ready');
    } catch (e) {
      if (isCancel(e)) return;
      setStatus('error');
    } finally {
      if (!controller.signal.aborted) setIsRefreshing(false);
    }
  }, []);

  // Also reruns when the screen regains focus, so changes made in the admin screens show up.
  useFocusEffect(
    useCallback(() => {
      // Waits for the user to stop typing before searching.
      const timer = setTimeout(() => load(search), search ? SEARCH_DELAY : 0);

      return () => {
        clearTimeout(timer);
        requestRef.current?.abort();
      };
    }, [load, search])
  );

  function reload() {
    setStatus('loading');
    load(search);
  }

  function refresh() {
    setIsRefreshing(true);
    load(search);
  }

  const contentPlatformStyle = Platform.select({
    web: { paddingTop: Spacing.six },
    default: { paddingTop: insets.top },
  });

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, contentPlatformStyle]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Posts</ThemedText>
          <View style={styles.headerActions}>
            <Link href="/admin" asChild>
              <Pressable accessibilityRole="button">
                <ThemedText type="linkPrimary">Gerenciar</ThemedText>
              </Pressable>
            </Link>
            <Pressable accessibilityRole="button" onPress={logout}>
              <ThemedText type="linkPrimary">Sair</ThemedText>
            </Pressable>
          </View>
        </View>

        <TextInput
          style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Buscar por título, autor ou palavra-chave"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Buscar posts"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {status === 'loading' ? (
          <ActivityIndicator style={styles.feedback} color={theme.text} />
        ) : status === 'error' ? (
          <View style={styles.feedback}>
            <ThemedText themeColor="textSecondary">Não foi possível carregar os posts.</ThemedText>
            <Pressable accessibilityRole="button" onPress={reload}>
              <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(post) => post.id}
            renderItem={({ item }) => <PostCard post={item} />}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + BottomTabInset + Spacing.three },
            ]}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.feedback}>
                {search ? `Nenhum post encontrado para "${search}".` : 'Nenhum post publicado ainda.'}
              </ThemedText>
            }
          />
        )}
      </View>
    </ThemedView>
  );
}

function PostCard({ post }: { post: Post }) {
  const theme = useTheme();

  return (
    <Link href={{ pathname: '/posts/[id]', params: { id: post.id } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          {post.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {post.author}
        </ThemedText>
        <ThemedText type="small">{post.description}</ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  search: {
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  feedback: {
    alignItems: 'center',
    textAlign: 'center',
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
