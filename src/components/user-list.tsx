import { isCancel } from 'axios';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoleConfig } from '@/constants/roles';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiMessage, type Role, type User } from '@/services/api';
import { deleteUser, getUsers, type Page } from '@/services/users';
import { showError } from '@/utils/alert';
import { confirm } from '@/utils/confirm';

type Status = 'loading' | 'ready' | 'error';

/** Paginated list of professores or alunos, with edit and delete actions. */
export function UserList({ role }: { role: Role }) {
  const config = RoleConfig[role];
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<User> | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (target: number) => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;

      try {
        const data = await getUsers(role, target, controller.signal);
        // The page can disappear after deletions (here or on another device): step back to the last one.
        if (data.data.length === 0 && target > 1) {
          setPage(Math.max(1, data.totalPages));
          return;
        }
        setResult(data);
        setStatus('ready');
      } catch (e) {
        if (isCancel(e)) return;
        setStatus('error');
      } finally {
        if (!controller.signal.aborted) setIsRefreshing(false);
      }
    },
    [role]
  );

  // Reloads when the page changes and when the screen regains focus (after creating or editing).
  useFocusEffect(
    useCallback(() => {
      load(page);
      return () => requestRef.current?.abort();
    }, [load, page])
  );

  function goToPage(target: number) {
    setStatus('loading');
    setPage(target);
  }

  function reload() {
    setStatus('loading');
    load(page);
  }

  function refresh() {
    setIsRefreshing(true);
    load(page);
  }

  async function handleDelete(user: User) {
    const confirmed = await confirm(
      `Excluir ${config.singular}`,
      `Tem certeza que deseja excluir "${user.nome}"? Essa ação não pode ser desfeita.`,
      'Excluir'
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    try {
      await deleteUser(role, user.id);
      await load(page);
    } catch (e) {
      showError(getApiMessage(e) ?? `Não foi possível excluir o ${config.singular}. Tente novamente.`);
    } finally {
      setDeletingId(null);
    }
  }

  if (status === 'error') {
    return <ErrorState onRetry={reload} plural={config.plural} />;
  }

  if (status === 'loading' || !result) {
    return (
      <ThemedView style={styles.feedback}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  const totalPages = Math.max(1, result.totalPages);

  return (
    <FlatList
      // The iOS header is translucent and sits over the screen: this pushes the content below it.
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      data={result.data}
      keyExtractor={(user) => user.id}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.four }]}
      ListHeaderComponent={
        <Link href={config.newHref} asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.text },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={{ color: theme.background }}>{config.newLabel}</ThemedText>
          </Pressable>
        </Link>
      }
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum {config.singular} cadastrado ainda.
        </ThemedText>
      }
      ListFooterComponent={
        result.total > 0 ? (
          <View style={styles.pagination}>
            <PageButton label="Anterior" disabled={page <= 1} onPress={() => goToPage(page - 1)} />
            <ThemedText type="small" themeColor="textSecondary">
              Página {page} de {totalPages}
            </ThemedText>
            <PageButton
              label="Próxima"
              disabled={page >= totalPages}
              onPress={() => goToPage(page + 1)}
            />
          </View>
        ) : undefined
      }
      renderItem={({ item }) => {
        const isDeleting = deletingId === item.id;

        return (
          <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{item.nome}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.username} · {item.email}
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Link href={{ pathname: config.editPath, params: { id: item.id } }} asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.nome}`}
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
                accessibilityLabel={`Excluir ${item.nome}`}
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

function ErrorState({ plural, onRetry }: { plural: string; onRetry: () => void }) {
  return (
    <ThemedView style={styles.feedback}>
      <ThemedText themeColor="textSecondary">
        Não foi possível carregar os {plural.toLowerCase()}.
      </ThemedText>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

type PageButtonProps = {
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function PageButton({ label, disabled, onPress }: PageButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: theme.backgroundSelected },
        (pressed || disabled) && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <ThemedText type="small">{label}</ThemedText>
    </Pressable>
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
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
