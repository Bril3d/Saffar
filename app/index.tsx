import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { roleHomePath } from '@/types/domain';
import { useAuthStore } from '@/store/authStore';

export default function IndexRoute() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const role = useAuthStore((state) => state.role);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>SAFAR</Text>
        <Text style={styles.brandSub}>CHAIN</Text>
        <ActivityIndicator color={colors.accent.primary} size="small" style={styles.spinner} />
      </View>
    );
  }

  return <Redirect href={role ? roleHomePath(role) : '/login'} />;
}

const styles = StyleSheet.create({
  brand: {
    color: colors.accent.primary,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 6,
  },
  brandSub: {
    ...typography.overline,
    color: colors.text.tertiary,
    fontSize: 14,
    letterSpacing: 4,
    marginTop: 4,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    flex: 1,
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 24,
  },
});
