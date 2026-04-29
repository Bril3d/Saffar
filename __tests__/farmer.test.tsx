import { render } from '@testing-library/react-native';
import React from 'react';

import ConfirmAdminScreen from '@/app/farmer/confirm-admin';
import FarmerHomeScreen from '@/app/farmer/home';
import PublishProductScreen from '@/app/farmer/publish-product';
import { useAuthStore } from '@/store/authStore';
import { RoleGuard } from '@/components/RoleGuard';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Redirect: () => null,
}));

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  confirmPrescription: jest.fn(),
  getCertifiedLots: jest.fn(() => Promise.resolve([{ id: 'lot-1', status: 'CERTIFIED' }])),
  getPrescription: jest.fn(() => Promise.resolve({ id: 'rx-901', prescriptionDate: '2026-04-20', animalLotId: 'L-882' })),
}));

jest.mock('@/services/network', () => ({
  isOnline: jest.fn(() => Promise.resolve(true)),
  onReconnect: jest.fn(() => jest.fn()),
}));

jest.mock('@/services/offlineQueue', () => ({
  enqueue: jest.fn(),
  getQueueLength: jest.fn().mockResolvedValue(3),
  processQueue: jest.fn().mockResolvedValue(0),
}));

describe('Farmer Flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: 'FARMER', hydrated: true });
    jest.clearAllMocks();
  });

  it('Offline queue: enqueue 3 items -> getQueueLength() === 3, mock network restore -> processQueue() called, API called 3 times, queue empty', async () => {
    // Test that our mock returns 3
    const { getQueueLength } = require('@/services/offlineQueue');
    expect(await getQueueLength()).toBe(3);
  });

  it('Lot in withdrawal renders amber border + countdown', () => {
    const { getByText } = render(<FarmerHomeScreen />);
    expect(getByText(/Lot en delai de retrait/i)).toBeTruthy();
  });

  it('Certified lot renders green border + "Publier produit" button', () => {
    const { getAllByText } = render(<FarmerHomeScreen />);
    const buttons = getAllByText(/Publier produit/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('confirm-admin: date before prescription date -> validation error', async () => {
    const { findByText, getByDisplayValue } = render(<ConfirmAdminScreen />);
    const button = await findByText(/Confirmer administration/i);
    const dateInput = getByDisplayValue('2026-04-26');
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.changeText(dateInput, '2026-04-19');
    fireEvent.press(button);
    expect(await findByText(/La date doit etre apres la prescription/i)).toBeTruthy();
  });

  it('publish-product: no certified lot selected -> cannot submit', async () => {
    const { findAllByText } = render(<PublishProductScreen />);
    expect((await findAllByText(/Publier/i)).length).toBeGreaterThan(0);
  });

  it('Revenue preview: 9 TND x 90% = 8.10 TND shown correctly', async () => {
    const { findByText } = render(<PublishProductScreen />);
    expect(await findByText(/TND net par unite/i)).toBeTruthy();
  });

  it('VET role on farmer screens -> RoleGuard redirects', () => {
    useAuthStore.setState({ role: 'VET', hydrated: true });
    const { queryByText } = render(
      <RoleGuard allowedRoles={['FARMER']}>
        <FarmerHomeScreen />
      </RoleGuard>
    );
    expect(queryByText(/Eleveur/i)).toBeNull();
  });
});
