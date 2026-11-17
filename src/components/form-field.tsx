import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Labelled text input shared by the post and user forms. */
export function FormField({ label, style, ...props }: TextInputProps & { label: string }) {
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

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <ThemedText type="small" style={styles.error} accessibilityRole="alert">
      {message}
    </ThemedText>
  );
}

type SubmitButtonProps = {
  label: string;
  isSubmitting: boolean;
  onPress: () => void;
};

export function SubmitButton({ label, isSubmitting, onPress }: SubmitButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isSubmitting}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.text },
        (pressed || isSubmitting) && styles.pressed,
      ]}>
      {isSubmitting ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <ThemedText style={{ color: theme.background }}>{label}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
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
