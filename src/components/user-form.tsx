import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormError, FormField, SubmitButton } from '@/components/form-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiMessage } from '@/services/api';
import type { UserInput } from '@/services/users';

type UserFormProps = {
  initialValues: UserInput;
  /** On edit the password is optional: leaving it blank keeps the current one. */
  isEditing: boolean;
  submitLabel: string;
  onSubmit: (values: UserInput) => Promise<void>;
};

export function UserForm({ initialValues, isEditing, submitLabel, onSubmit }: UserFormProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField(field: keyof UserInput) {
    return (text: string) => setValues((current) => ({ ...current, [field]: text }));
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    const input: UserInput = {
      nome: values.nome.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      senha: values.senha,
    };

    // Same required fields as the API.
    const missingPassword = !isEditing && !input.senha;
    if (!input.nome || !input.username || !input.email || missingPassword) {
      setError(
        isEditing ? 'Preencha nome, username e e-mail.' : 'Preencha nome, username, e-mail e senha.'
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (e) {
      setError(getApiMessage(e) ?? 'Não foi possível salvar. Tente novamente.');
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.four }]}>
      <View style={styles.form}>
        <FormField
          label="Nome"
          value={values.nome}
          onChangeText={setField('nome')}
          autoComplete="name"
        />
        <FormField
          label="Username"
          value={values.username}
          onChangeText={setField('username')}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormField
          label="E-mail"
          value={values.email}
          onChangeText={setField('email')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
        />
        <FormField
          label={isEditing ? 'Senha (deixe em branco para manter a atual)' : 'Senha'}
          value={values.senha}
          onChangeText={setField('senha')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          secureTextEntry
        />

        <FormError message={error} />
        <SubmitButton label={submitLabel} isSubmitting={isSubmitting} onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
