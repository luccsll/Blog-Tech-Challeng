import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiMessage } from '@/services/api';
import type { PostInput } from '@/services/posts';

type PostFormProps = {
  initialValues: PostInput;
  submitLabel: string;
  onSubmit: (values: PostInput) => Promise<void>;
};

export function PostForm({ initialValues, submitLabel, onSubmit }: PostFormProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField(field: keyof PostInput) {
    return (text: string) => setValues((current) => ({ ...current, [field]: text }));
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    const input: PostInput = {
      title: values.title.trim(),
      author: values.author.trim(),
      description: values.description.trim(),
      content: values.content.trim(),
    };

    // Same required fields as the API.
    if (!input.title || !input.author || !input.content) {
      setError('Preencha título, autor e conteúdo.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (e) {
      setError(getApiMessage(e) ?? 'Não foi possível salvar o post. Tente novamente.');
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
          <Field label="Título" value={values.title} onChangeText={setField('title')} />
          <Field label="Autor" value={values.author} onChangeText={setField('author')} />
          <Field
            label="Descrição (opcional)"
            value={values.description}
            onChangeText={setField('description')}
            multiline
          />
          <Field
            label="Conteúdo"
            value={values.content}
            onChangeText={setField('content')}
            multiline
            style={styles.content}
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
              <ThemedText style={{ color: theme.background }}>{submitLabel}</ThemedText>
            )}
          </Pressable>
        </View>
    </ScrollView>
  );
}

function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }, style]}
        {...props}
      />
    </View>
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
  field: {
    gap: Spacing.one,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  content: {
    minHeight: 200,
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
