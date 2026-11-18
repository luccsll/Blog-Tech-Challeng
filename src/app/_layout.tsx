import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const isLoggedIn = !!user;

  return (
    <>
      {/* The overlay hides the native splash, so it waits for the stored session. */}
      {!isLoading && <AnimatedSplashOverlay />}
      <Stack screenOptions={{ headerShown: false }}>
        {/* The post list opens first, logged in or not: reading posts needs no login. */}
        <Stack.Screen name="(app)" />

        {/* Once logged in, the login screen closes and the user is back on the post list. */}
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
