import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { roleHomePath } from '@/types/domain';
import { useAuthStore } from '@/store/authStore';

export default function IndexRoute() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const role = useAuthStore((state) => state.role);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#166534" size="large" />
      </View>
    );
  }

  return <Redirect href={role ? roleHomePath(role) : '/login'} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
  },
});
