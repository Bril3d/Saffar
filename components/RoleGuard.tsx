import { Redirect } from 'expo-router';
import { type ComponentType, type PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
        <ActivityIndicator color="#166534" size="large" />
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
  loading: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
  },
});
