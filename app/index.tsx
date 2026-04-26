/**
 * App entry point — redirects to the onboarding screen.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)/onboarding" />;
}
