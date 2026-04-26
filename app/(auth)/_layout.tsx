import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg.primary },
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    />
  );
}
