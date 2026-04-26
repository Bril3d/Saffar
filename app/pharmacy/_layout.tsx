import { Stack } from 'expo-router';

import { withRoleGuard } from '@/components/RoleGuard';

function PharmacyLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="new-sale" options={{ title: 'Nouvelle vente' }} />
      <Stack.Screen name="sale-confirmed" options={{ title: 'Vente confirmee' }} />
    </Stack>
  );
}

export default withRoleGuard(['PHARMACY'], PharmacyLayout);
