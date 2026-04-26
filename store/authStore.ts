/**
 * SAFAR Chain — Auth Store
 * Real JWT authentication against POST /api/auth/login.
 * Uses React context for global state, with a synchronous snapshot
 * so the axios interceptor can read the token outside the tree.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

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

/* ── Synchronous snapshot for axios interceptor ────────── */

let _snapshot: AuthState = { ...initialState };

export function getAuthSnapshot(): AuthState {
  return _snapshot;
}

/* ── Context ──────────────────────────────────────────── */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Keep snapshot in sync
  useEffect(() => {
    _snapshot = state;
  }, [state]);

  const login = useCallback(async (role: Role, email: string, password: string) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

    const { token, user } = res.data.data;

    // Validate the backend-returned role matches the selected role
    if (user.role !== role) {
      throw new Error(`Ce compte est enregistré comme ${user.role}, pas ${role}.`);
    }

    setState({
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
    });
  }, []);

  const register = useCallback(async (role: Role, name: string, email: string, password: string) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { role, name, email, password });

    const { token, user } = res.data.data;

    setState({
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
    });
  }, []);

  const logout = useCallback(() => {
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
