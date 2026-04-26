import { Stack } from 'expo-router';

import { withRoleGuard } from '@/components/RoleGuard';

function AbattoirLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ title: 'Scanner un lot' }} />
      <Stack.Screen name="result-eligible" options={{ title: 'Lot eligible' }} />
      <Stack.Screen name="result-rejected" options={{ title: 'Lot non eligible' }} />
    </Stack>
  );
}

export default withRoleGuard(['SLAUGHTERHOUSE'], AbattoirLayout);
