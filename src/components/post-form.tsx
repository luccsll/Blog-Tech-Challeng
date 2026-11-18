import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormError, FormField, SubmitButton } from '@/components/form-field';
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
      // The iOS header is translucent and sits over the screen: this pushes the content below it.
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.four }]}>
      <View style={styles.form}>
        <FormField label="Título" value={values.title} onChangeText={setField('title')} />
        <FormField label="Autor" value={values.author} onChangeText={setField('author')} />
        <FormField
          label="Descrição (opcional)"
          value={values.description}
          onChangeText={setField('description')}
          multiline
        />
        <FormField
          label="Conteúdo"
          value={values.content}
          onChangeText={setField('content')}
          multiline
          style={styles.content}
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
  content: {
    minHeight: 200,
  },
});
