import { beforeEach, expect, it } from '@jest/globals';

import { useAuthStore } from '@/store/authStore';

beforeEach(() => {
  useAuthStore.setState({
    hydrated: true,
    role: null,
    token: null,
    userId: null,
    walletAddress: null,
  });
});

it('stores the selected VET role on login', async () => {
  await useAuthStore.getState().login({ role: 'VET' });

  expect(useAuthStore.getState().role).toBe('VET');
  expect(useAuthStore.getState().token).toBe('mock-jwt-vet');
});

it('clears the session on logout', async () => {
  await useAuthStore.getState().login({ role: 'FARMER' });
  await useAuthStore.getState().logout();

  expect(useAuthStore.getState().role).toBeNull();
  expect(useAuthStore.getState().token).toBeNull();
});
