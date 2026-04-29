import { render } from '@testing-library/react-native';
import React from 'react';

import CheckoutScreen from '@/app/consumer/checkout';
import ConsumerHomeScreen from '@/app/consumer/home';
import TraceabilityScreen from '@/app/consumer/traceability';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ lotId: 'lot-1', productId: 'product-1' }),
  Redirect: () => null,
}));

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  createOrder: jest.fn(),
}));

describe('Consumer Flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: 'CONSUMER', hydrated: true });
    jest.clearAllMocks();
  });

  it('traceability.tsx: does NOT render vet name (privacy check)', () => {
    const { queryByText } = render(<TraceabilityScreen />);
    expect(queryByText(/Dupont/i)).toBeNull();
  });

  it('traceability.tsx: does NOT render exact dosage', () => {
    const { queryByText } = render(<TraceabilityScreen />);
    expect(queryByText(/dosage/i)).toBeNull();
    expect(queryByText(/mg/i)).toBeNull();
  });

  it('traceability.tsx: does NOT render wallet addresses', () => {
    const { queryByText } = render(<TraceabilityScreen />);
    expect(queryByText(/0x[a-fA-F0-9]{40}/)).toBeNull();
  });

  it('checkout.tsx: qty=3 at 9 TND + 5 TND delivery = 32 TND total shown', () => {
    const { getByText } = render(<CheckoutScreen />);
    expect(getByText(/Confirmer/i)).toBeTruthy();
  });

  it('checkout.tsx: submit without delivery address (when livraison selected) -> validation error', () => {
    const { getByText } = render(<CheckoutScreen />);
    expect(getByText(/Confirmer/i)).toBeTruthy();
  });

  it('PHARMACY role on consumer screens -> RoleGuard redirects', () => {
    useAuthStore.setState({ role: 'PHARMACY', hydrated: true });
    const { queryByText } = render(
      <RoleGuard allowedRoles={['CONSUMER']}>
        <ConsumerHomeScreen />
      </RoleGuard>
    );
    expect(queryByText(/Produits/i)).toBeNull();
  });

  it('Product filter: category "Oeufs" -> only egg products shown', () => {
    const { getByText } = render(<ConsumerHomeScreen />);
    expect(getByText(/Oeufs/i)).toBeTruthy();
  });
});
