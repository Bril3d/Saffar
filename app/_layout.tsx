import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { colors, lightColors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const colorScheme = useColorScheme();
  // Force light mode to apply the SaaS Light palette globally
  const isDark = false; 

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const activeColors = colors;

  const safarTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: activeColors.bg.primary,
      card: activeColors.bg.secondary,
      border: activeColors.border.default,
      text: activeColors.text.primary,
      primary: activeColors.accent.primary,
      notification: activeColors.status.danger,
    },
  };

  return (
    <ThemeProvider value={safarTheme}>
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

