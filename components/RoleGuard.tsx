import { Redirect } from 'expo-router';
import { type ComponentType, type PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { type Role } from '@/types/domain';

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: Role[];
}>;

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const role = useAuthStore((state) => state.role);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>SAFAR</Text>
        <ActivityIndicator color={colors.accent.primary} size="small" />
      </View>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

export function withRoleGuard<TProps extends object>(
  allowedRoles: Role[],
  Navigator: ComponentType<TProps>
) {
  return function GuardedNavigator(props: TProps) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Navigator {...props} />
      </RoleGuard>
    );
  };
}

const styles = StyleSheet.create({
  brand: {
    ...typography.overline,
    color: colors.accent.primary,
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 16,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    flex: 1,
    justifyContent: 'center',
  },
});
