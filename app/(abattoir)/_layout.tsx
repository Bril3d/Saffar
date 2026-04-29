import { Stack } from 'expo-router';
export default function AbattoirLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="result-eligible" />
      <Stack.Screen name="result-rejected" />
      <Stack.Screen name="history" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
