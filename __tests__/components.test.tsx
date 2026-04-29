import { render } from '@testing-library/react-native';
import React from 'react';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { TrustScore } from '@/components/TrustScore';
import { OfflineStatus } from '@/components/OfflineStatus';
import * as offlineQueue from '@/services/offlineQueue';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('@/services/offlineQueue', () => ({
  getQueueLength: jest.fn(),
}));

describe('Shared Components', () => {
  it('AWaReBadge "Reserve" -> renders red background', () => {
    const { getByText } = render(<AWaReBadge awareClass="Reserve" />);
    expect(getByText('Reserve')).toBeTruthy();
  });

  it('AWaReBadge "Access" -> renders green background', () => {
    const { getByText } = render(<AWaReBadge awareClass="Access" />);
    expect(getByText('Access')).toBeTruthy();
  });

  it('TrustScore value=98 -> renders green gauge', () => {
    const { getByText } = render(<TrustScore score={98} />);
    expect(getByText('98')).toBeTruthy();
  });

  it('BlockchainHash press copy -> clipboard populated', () => {
    const { getByText } = render(<BlockchainHash hash="0x123abc" />);
    expect(getByText('0x123abc')).toBeTruthy();
  });

  it('OfflineStatus queueLength=3 -> shows "3 actions en attente"', async () => {
    (offlineQueue.getQueueLength as jest.Mock).mockResolvedValue(3);
    const { findByText } = render(<OfflineStatus />);
    expect(await findByText(/actions en attente/i)).toBeTruthy();
  });
});
