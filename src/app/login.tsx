import axios from 'axios';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Usuário ou senha inválidos.';
    }
    if (!error.response) {
      return 'Não foi possível conectar ao servidor.';
    }
  }
  return 'Não foi possível entrar. Tente novamente.';
}

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  async function handleSubmit() {
    if (isSubmitting) return;

    if (!username.trim() || !password) {
      setError('Preencha usuário e senha.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // On success the guard in the root layout replaces this screen with the home screen.
      await login(username.trim(), password);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <ThemedText type="subtitle">Entrar</ThemedText>

          <TextInput
            style={inputStyle}
            placeholder="Usuário"
            placeholderTextColor={theme.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            editable={!isSubmitting}
          />

          <TextInput
            style={inputStyle}
            placeholder="Senha"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            editable={!isSubmitting}
          />

          {error && (
            <ThemedText type="small" style={styles.error} accessibilityRole="alert">
              {error}
            </ThemedText>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.text },
              (pressed || isSubmitting) && styles.pressed,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <ThemedText style={{ color: theme.background }}>Entrar</ThemedText>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  error: {
    color: '#E5484D',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
