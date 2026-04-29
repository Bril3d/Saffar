import { Stack } from 'expo-router';
export default function PharmacyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="new-sale" />
      <Stack.Screen name="sale-confirmed" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
