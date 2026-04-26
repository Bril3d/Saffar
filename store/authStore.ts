/**
 * SAFAR Chain — Auth Store
 * Simple reactive auth state with role-based access control.
 * Uses React context (no external deps like Zustand needed for now).
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Role = 'PHARMACY' | 'VET' | 'FARMER' | 'SLAUGHTERHOUSE' | 'CONSUMER';

export interface AuthState {
  role: Role | null;
  userId: string | null;
  walletAddress: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (role: Role, email: string, password: string) => Promise<void>;
  logout: () => void;
  selectRole: (role: Role) => void;
  selectedRole: Role | null;
}

const initialState: AuthState = {
  role: null,
  userId: null,
  walletAddress: null,
  token: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const login = useCallback(async (role: Role, email: string, _password: string) => {
    // Mock login for hackathon — in production, POST /api/auth/login
    await new Promise((resolve) => setTimeout(resolve, 800));

    setState({
      role,
      userId: `user_${Date.now()}`,
      walletAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      token: `jwt_mock_${Date.now()}`,
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
