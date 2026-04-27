/**
 * Farm Care — Auth Store
 * Real JWT authentication against POST /api/auth/login.
 * Uses React context for global state, with a synchronous snapshot
 * so the axios interceptor can read the token outside the tree.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const STORAGE_KEY = 'farmcare_auth_state';

export type Role = 'PHARMACY' | 'VET' | 'FARMER' | 'SLAUGHTERHOUSE' | 'CONSUMER';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  walletAddress: string | null;
}

export interface AuthState {
  role: Role | null;
  userId: string | null;
  walletAddress: string | null;
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (role: Role, email: string, password: string) => Promise<void>;
  register: (role: Role, name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  selectRole: (role: Role) => void;
  selectedRole: Role | null;
}

const initialState: AuthState = {
  role: null,
  userId: null,
  walletAddress: null,
  token: null,
  user: null,
  isAuthenticated: false,
};

/* ── Load persisted state SYNCHRONOUSLY on module init ───── */

function loadPersistedState(): AuthState {
  if (Platform.OS !== 'web') return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token && parsed.isAuthenticated && parsed.user) {
        return parsed as AuthState;
      }
    }
  } catch (e) {
    console.warn('[Auth] Failed to restore from localStorage', e);
  }
  // Cleanup legacy key
  try { localStorage.removeItem('safar_auth_state'); } catch { }
  return initialState;
}

const _restoredState = loadPersistedState();

/* ── Synchronous snapshot for axios interceptor ────────── */

let _snapshot: AuthState = _restoredState;

export function getAuthSnapshot(): AuthState {
  return _snapshot;
}

/* ── Persist to localStorage ─────────────────────────────── */

function persistState(state: AuthState) {
  if (Platform.OS !== 'web') return;
  try {
    if (state.isAuthenticated && state.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[Auth] Failed to persist state', e);
  }
}

/* ── Context ──────────────────────────────────────────── */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from the already-loaded persisted state
  const [state, setState] = useState<AuthState>(_restoredState);
  const [selectedRole, setSelectedRole] = useState<Role | null>(_restoredState.role);

  // Keep snapshot in sync and persist to localStorage whenever state changes
  useEffect(() => {
    _snapshot = state;
    persistState(state);
  }, [state]);

  const login = useCallback(async (role: Role, email: string, password: string) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

    const { token, user } = res.data.data;

    // Validate the backend-returned role matches the selected role
    if (user.role !== role) {
      throw new Error(`Ce compte est enregistré comme ${user.role}, pas ${role}.`);
    }

    const newState: AuthState = {
      role: user.role as Role,
      userId: user.id,
      walletAddress: user.walletAddress || null,
      token,
      user: {
        id: user.id,
        role: user.role as Role,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress || null,
      },
      isAuthenticated: true,
    };

    // Update snapshot IMMEDIATELY (before React re-render)
    _snapshot = newState;
    persistState(newState);
    setState(newState);
    setSelectedRole(user.role as Role);
  }, []);

  const register = useCallback(async (role: Role, name: string, email: string, password: string) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { role, name, email, password });

    const { token, user } = res.data.data;

    const newState: AuthState = {
      role: (user.role || role) as Role,
      userId: user.id,
      walletAddress: null,
      token,
      user: {
        id: user.id,
        role: (user.role || role) as Role,
        name: user.name,
        email: user.email,
        walletAddress: null,
      },
      isAuthenticated: true,
    };

    _snapshot = newState;
    persistState(newState);
    setState(newState);
    setSelectedRole((user.role || role) as Role);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    _snapshot = initialState;
    persistState(initialState);
    setState(initialState);
    setSelectedRole(null);
  }, []);

  const selectRole = useCallback((role: Role) => {
    setSelectedRole(role);
  }, []);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        ...state,
        login,
        register,
        logout,
        selectRole,
        selectedRole,
      },
    },
    children
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
