import { Stack } from 'expo-router';
export default function FarmerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="confirm-admin" />
      <Stack.Screen name="publish-product" />
      <Stack.Screen name="lots" />
      <Stack.Screen name="farmer-sales" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="lot-details" />
      <Stack.Screen name="ai-assistant" />
      <Stack.Screen name="add-lot" />
    </Stack>
  );
}
