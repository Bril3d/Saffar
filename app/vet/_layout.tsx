import { Stack } from 'expo-router';

import { withRoleGuard } from '@/components/RoleGuard';

function VetLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="new-prescription" options={{ title: 'Nouvelle prescription' }} />
      <Stack.Screen name="prescription-detail" options={{ title: 'Prescription' }} />
    </Stack>
  );
}

export default withRoleGuard(['VET'], VetLayout);
