import { getAuthSnapshot, useAuthStore } from '@/store/authStore';
import { type Role } from '@/types/domain';

export type LoginInput = {
  email?: string;
  password?: string;
  role: Role;
};

export async function login(input: LoginInput) {
  await useAuthStore.getState().login(input);

  return getAuthSnapshot();
}

export async function logout() {
  await useAuthStore.getState().logout();
}

export function getSession() {
  return getAuthSnapshot();
}
