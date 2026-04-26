import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { type Role } from '@/types/domain';

type AuthSession = {
  role: Role | null;
  token: string | null;
  userId: string | null;
  walletAddress: string | null;
};

type LoginCredentials = {
  email?: string;
  password?: string;
  role: Role;
};

type AuthState = AuthSession & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'safar.auth.session';

const EMPTY_SESSION: AuthSession = {
  role: null,
  token: null,
  userId: null,
  walletAddress: null,
};

const MOCK_USERS: Record<Role, Omit<AuthSession, 'role' | 'token'>> = {
  PHARMACY: {
    userId: 'pharmacy-001',
    walletAddress: '0xPharmacyDemoWallet',
  },
  VET: {
    userId: 'vet-001',
    walletAddress: '0xVetDemoWallet',
  },
  FARMER: {
    userId: 'farmer-001',
    walletAddress: '0xFarmerDemoWallet',
  },
  SLAUGHTERHOUSE: {
    userId: 'abattoir-001',
    walletAddress: '0xAbattoirDemoWallet',
  },
  CONSUMER: {
    userId: 'consumer-001',
    walletAddress: null,
  },
};

async function readSession() {
  try {
    const raw =
      Platform.OS === 'web'
        ? globalThis.localStorage?.getItem(STORAGE_KEY)
        : await SecureStore.getItemAsync(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

async function writeSession(session: AuthSession | null) {
  try {
    if (Platform.OS === 'web') {
      if (session) {
        globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      }
      return;
    }

    if (session) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  } catch {
    // Session persistence should never block a hackathon demo login.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...EMPTY_SESSION,
  hydrated: false,
  hydrate: async () => {
    const session = await readSession();
    set({ ...(session ?? EMPTY_SESSION), hydrated: true });
  },
  login: async ({ role }) => {
    const mockUser = MOCK_USERS[role];
    const session: AuthSession = {
      ...mockUser,
      role,
      token: `mock-jwt-${role.toLowerCase()}`,
    };

    set({ ...session, hydrated: true });
    await writeSession(session);
  },
  logout: async () => {
    set({ ...EMPTY_SESSION, hydrated: true });
    await writeSession(null);
  },
}));

export function getAuthSnapshot() {
  const { role, token, userId, walletAddress } = useAuthStore.getState();

  return { role, token, userId, walletAddress };
}
