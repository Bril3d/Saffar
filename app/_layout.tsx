import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const safarDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg.primary,
    card: colors.bg.secondary,
    border: colors.border.default,
    text: colors.text.primary,
    primary: colors.accent.primary,
    notification: colors.status.danger,
  },
};

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemeProvider value={safarDark}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
          animationDuration: 280,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="pharmacy" />
        <Stack.Screen name="vet" />
        <Stack.Screen name="farmer" />
        <Stack.Screen name="abattoir" />
        <Stack.Screen name="consumer" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
