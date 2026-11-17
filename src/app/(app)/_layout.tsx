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
        <Stack.Screen name="admin/index" options={{ title: 'Gerenciar' }} />
        <Stack.Screen name="admin/posts" options={{ title: 'Posts' }} />
        <Stack.Screen name="posts/new" options={{ title: 'Novo post' }} />
        <Stack.Screen name="posts/[id]/edit" options={{ title: 'Editar post' }} />

        <Stack.Screen name="professores/index" options={{ title: 'Professores' }} />
        <Stack.Screen name="professores/new" options={{ title: 'Novo professor' }} />
        <Stack.Screen name="professores/[id]/edit" options={{ title: 'Editar professor' }} />

        <Stack.Screen name="alunos/index" options={{ title: 'Alunos' }} />
        <Stack.Screen name="alunos/new" options={{ title: 'Novo aluno' }} />
        <Stack.Screen name="alunos/[id]/edit" options={{ title: 'Editar aluno' }} />
      </Stack.Protected>
    </Stack>
  );
}
