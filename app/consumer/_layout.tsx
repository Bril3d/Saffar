import { Stack } from 'expo-router';

import { withRoleGuard } from '@/components/RoleGuard';

function ConsumerLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="product-detail" options={{ title: 'Produit' }} />
      <Stack.Screen name="traceability" options={{ title: 'Tracabilite' }} />
      <Stack.Screen name="scanner" options={{ title: 'Scanner QR' }} />
      <Stack.Screen name="checkout" options={{ title: 'Commande' }} />
      <Stack.Screen name="orders" options={{ title: 'Commandes' }} />
    </Stack>
  );
}

export default withRoleGuard(['CONSUMER'], ConsumerLayout);
