import { Stack } from 'expo-router';
export default function VetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="new-prescription" />
      <Stack.Screen name="prescription-detail" />
      <Stack.Screen name="prescriptions" />
      <Stack.Screen name="ai-assistant" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
