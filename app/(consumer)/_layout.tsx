import { Stack } from 'expo-router';
export default function ConsumerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="product-detail" />
      <Stack.Screen name="traceability" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
