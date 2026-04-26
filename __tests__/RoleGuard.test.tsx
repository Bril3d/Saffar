import { beforeEach, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { RoleGuard } from '@/components/RoleGuard';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => {
  const { Text } = require('react-native');

  return {
    Redirect: ({ href }: { href: string }) => <Text testID="redirect">{href}</Text>,
  };
});

beforeEach(() => {
  useAuthStore.setState({
    hydrated: true,
    role: null,
    token: null,
    userId: null,
    walletAddress: null,
  });
});

it('redirects a consumer away from pharmacy routes', () => {
  useAuthStore.setState({ role: 'CONSUMER' });

  render(
    <RoleGuard allowedRoles={['PHARMACY']}>
      <Text>private pharmacy</Text>
    </RoleGuard>
  );

  expect(screen.getByTestId('redirect')).toHaveTextContent('/login');
});

it('renders children when the role matches', () => {
  useAuthStore.setState({ role: 'VET' });

  render(
    <RoleGuard allowedRoles={['VET']}>
      <Text>private vet</Text>
    </RoleGuard>
  );

  expect(screen.getByText('private vet')).toBeTruthy();
});

it('redirects unauthenticated users', () => {
  render(
    <RoleGuard allowedRoles={['FARMER']}>
      <Text>private farmer</Text>
    </RoleGuard>
  );

  expect(screen.getByTestId('redirect')).toHaveTextContent('/login');
});
