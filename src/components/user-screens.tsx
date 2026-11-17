import { isAxiosError, isCancel } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserForm } from '@/components/user-form';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiMessage, type Role, type User } from '@/services/api';
import { createUser, getUser, updateUser, type UserInput } from '@/services/users';

const EMPTY_USER: UserInput = { nome: '', username: '', email: '', senha: '' };

export function NewUserScreen({ role }: { role: Role }) {
  async function handleSubmit(values: UserInput) {
    await createUser(role, values);
    router.back();
  }

  return (
    <UserForm
      initialValues={EMPTY_USER}
      isEditing={false}
      submitLabel="Cadastrar"
      onSubmit={handleSubmit}
    />
  );
}

export function EditUserScreen({ role }: { role: Role }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getUser(role, id, controller.signal)
      .then(setUser)
      .catch((e) => {
        if (isCancel(e)) return;
        // The API sends "Professor não encontrado." / "Aluno não encontrado." on 404.
        setError(
          (isAxiosError(e) && e.response?.status === 404 && getApiMessage(e)) ||
            'Não foi possível carregar o cadastro.'
        );
      });

    return () => controller.abort();
  }, [role, id, reloadKey]);

  function reload() {
    setError(null);
    setReloadKey((key) => key + 1);
  }

  async function handleSubmit(values: UserInput) {
    await updateUser(role, id, values);
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

  if (!user) {
    return (
      <ThemedView style={styles.feedback}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  return (
    <UserForm
      initialValues={{ nome: user.nome, username: user.username, email: user.email, senha: '' }}
      isEditing
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
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
});
