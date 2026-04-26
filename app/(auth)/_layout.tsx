import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
        headerShown: false,
      }}
    />
  );
}
