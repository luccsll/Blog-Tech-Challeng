import { Stack } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

// Everything in this group sits behind the login guard in the root layout.
export default function AppLayout() {
  const { isProfessor } = useAuth();

  return (
    <Stack screenOptions={{ headerBackTitle: 'Voltar' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="posts/[id]/index" options={{ title: 'Post' }} />

      {/* Alunos only read posts: opening any of these sends them back to the post list. */}
      <Stack.Protected guard={isProfessor}>
        <Stack.Screen name="admin" options={{ title: 'Administração' }} />
        <Stack.Screen name="posts/new" options={{ title: 'Novo post' }} />
        <Stack.Screen name="posts/[id]/edit" options={{ title: 'Editar post' }} />
      </Stack.Protected>
    </Stack>
  );
}
