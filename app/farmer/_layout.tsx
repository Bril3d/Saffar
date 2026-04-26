import { Stack } from 'expo-router';

import { withRoleGuard } from '@/components/RoleGuard';

function FarmerLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-admin" options={{ title: 'Confirmer administration' }} />
      <Stack.Screen name="publish-product" options={{ title: 'Publier produit' }} />
      <Stack.Screen name="my-sales" options={{ title: 'Mes ventes' }} />
    </Stack>
  );
}

export default withRoleGuard(['FARMER'], FarmerLayout);
