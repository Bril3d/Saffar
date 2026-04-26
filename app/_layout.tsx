import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="pharmacy" />
        <Stack.Screen name="vet" />
        <Stack.Screen name="farmer" />
        <Stack.Screen name="abattoir" />
        <Stack.Screen name="consumer" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
