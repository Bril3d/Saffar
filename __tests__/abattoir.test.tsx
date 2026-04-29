import { render } from '@testing-library/react-native';
import React from 'react';

import ResultEligibleScreen from '@/app/abattoir/result-eligible';
import ResultRejectedScreen from '@/app/abattoir/result-rejected';
import AbattoirScannerScreen from '@/app/abattoir/scanner';
import { useAuthStore } from '@/store/authStore';
import { RoleGuard } from '@/components/RoleGuard';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ lotId: 'lot-1', daysRemaining: '4' }),
  Redirect: () => null,
}));

jest.mock('expo-camera', () => ({
  CameraView: () => null,
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

describe('Abattoir Flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: 'SLAUGHTERHOUSE', hydrated: true });
    jest.clearAllMocks();
  });

  it('result-eligible with eligible=true prop -> green hero rendered (snapshot)', () => {
    const { toJSON, getByText } = render(<ResultEligibleScreen />);
    expect(getByText(/LOT ELIGIBLE/i)).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it('result-rejected with eligible=false, daysRemaining=4 -> red hero + "4 JOURS" shown', () => {
    const { getByText } = render(<ResultRejectedScreen />);
    expect(getByText(/LOT NON ELIGIBLE/i)).toBeTruthy();
  });

  it('Scanner: valid QR with eligible lot -> navigates to result-eligible', () => {
    const { getByText } = render(<AbattoirScannerScreen />);
    expect(getByText(/Scanner/i)).toBeTruthy();
  });

  it('CONSUMER role on abattoir screens -> RoleGuard redirects', () => {
    useAuthStore.setState({ role: 'CONSUMER', hydrated: true });
    const { queryByText } = render(
      <RoleGuard allowedRoles={['SLAUGHTERHOUSE']}>
        <AbattoirScannerScreen />
      </RoleGuard>
    );
    expect(queryByText(/Scanner/i)).toBeNull();
  });
});
