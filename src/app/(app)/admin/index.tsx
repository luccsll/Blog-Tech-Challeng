import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SECTIONS: { title: string; description: string; href: Href }[] = [
  { title: 'Posts', description: 'Criar, editar e excluir posts.', href: '/admin/posts' },
  {
    title: 'Professores',
    description: 'Cadastrar, editar e excluir professores.',
    href: '/professores',
  },
  { title: 'Alunos', description: 'Cadastrar, editar e excluir alunos.', href: '/alunos' },
];

export default function AdminScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      // The iOS header is translucent and sits over the screen: this pushes the content below it.
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.four }]}>
      {SECTIONS.map((section) => (
        <Link key={section.title} href={section.href} asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              {section.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {section.description}
            </ThemedText>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
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
