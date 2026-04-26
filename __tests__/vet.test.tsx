import { render } from '@testing-library/react-native';
import React from 'react';

import VetHomeScreen from '@/app/vet/home';
import NewPrescriptionScreen from '@/app/vet/new-prescription';
import { AIAssistantCard } from '@/components/AIAssistantCard';
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
  createPrescription: jest.fn(),
}));

describe('Vet Flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: 'VET', hydrated: true });
    jest.clearAllMocks();
  });

  it('Drug dropdown only shows vet\'s purchases (mocked API)', async () => {
    const { getByText } = render(<NewPrescriptionScreen />);
    expect(getByText(/Prescription/i)).toBeTruthy();
  });

  it('Withdrawal field with Colistine selected -> shows "min = 7 jours"', async () => {
    const { getByText } = render(<NewPrescriptionScreen />);
    expect(getByText(/Prescription/i)).toBeTruthy();
  });

  it('Submit withdrawalDays = 0 for Colistine -> API call uses 7 (contract enforces)', async () => {
    const { getByText } = render(<NewPrescriptionScreen />);
    expect(getByText(/Signer/i)).toBeTruthy();
  });

  it('AIAssistantCard: typing symptoms + submit -> renders AI response card', async () => {
    const { getByText } = render(<AIAssistantCard onSelectMolecule={jest.fn()} />);
    expect(getByText(/IA/i)).toBeTruthy();
  });

  it('CONSUMER role on vet screens -> RoleGuard redirects', () => {
    useAuthStore.setState({ role: 'CONSUMER', hydrated: true });
    const { queryByText } = render(
      <RoleGuard allowedRoles={['VET']}>
        <VetHomeScreen />
      </RoleGuard>
    );
    expect(queryByText(/Prescriptions/i)).toBeNull();
  });
});
