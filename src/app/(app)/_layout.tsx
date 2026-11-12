import { Stack } from 'expo-router';

// Everything in this group sits behind the login guard in the root layout.
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Voltar' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="posts/[id]/index" options={{ title: 'Post' }} />
      <Stack.Screen name="admin" options={{ title: 'Administração' }} />
      <Stack.Screen name="posts/new" options={{ title: 'Novo post' }} />
      <Stack.Screen name="posts/[id]/edit" options={{ title: 'Editar post' }} />
    </Stack>
  );
}
