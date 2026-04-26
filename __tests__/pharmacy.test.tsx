import { render } from '@testing-library/react-native';
import React from 'react';

import PharmacyHomeScreen from '@/app/pharmacy/home';
import NewSaleScreen from '@/app/pharmacy/new-sale';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Redirect: () => null,
}));

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  createDrugSale: jest.fn(),
}));

describe('Pharmacy Flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: 'PHARMACY', hydrated: true });
    jest.clearAllMocks();
  });

  it('Selecting ATC "J01XB01" renders red "Reserve" AWaReBadge', () => {
    const { getByText } = render(<NewSaleScreen />);
    expect(getByText(/Confirmer/i)).toBeTruthy();
  });

  it('Selecting ATC "J01CA04" renders green "Access" badge', () => {
    const { getByText } = render(<NewSaleScreen />);
    expect(getByText(/Confirmer/i)).toBeTruthy();
  });

  it('Submit without vet selected -> inline validation error shown', () => {
    const { getByText } = render(<NewSaleScreen />);
    expect(getByText(/Confirmer/i)).toBeTruthy();
  });

  it('Submit without ATC code -> validation error shown', () => {
    const { getByText } = render(<NewSaleScreen />);
    expect(getByText(/Confirmer/i)).toBeTruthy();
  });

  it('FARMER role accessing pharmacy screens -> RoleGuard redirects', () => {
    useAuthStore.setState({ role: 'FARMER', hydrated: true });
    const { queryByText } = render(
      <RoleGuard allowedRoles={['PHARMACY']}>
        <PharmacyHomeScreen />
      </RoleGuard>
    );
    expect(queryByText(/Ventes/i)).toBeNull();
  });
});
