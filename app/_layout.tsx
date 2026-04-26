import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';


import { AuthProvider } from '@/store/authStore';
import { Colors } from '@/constants/theme';

/* ── Custom light theme matching Emerald Trace ──── */

const SafarTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.surfaceContainerLowest,
    card: Colors.surfaceContainerLowest,
    text: Colors.onSurface,
    border: Colors.outlineVariant,
    notification: Colors.primary,
  },
};

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={SafarTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(pharmacy)" />
          <Stack.Screen name="(vet)" />
          <Stack.Screen name="(farmer)" />
          <Stack.Screen name="(abattoir)" />
          <Stack.Screen name="(consumer)" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
