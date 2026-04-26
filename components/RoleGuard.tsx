import { Redirect } from 'expo-router';
import { type ComponentType, type PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { type Role } from '@/store/authStore';

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: Role[];
}>;

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
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
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  loading: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
});
