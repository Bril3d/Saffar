type PendingSdk = {
  status: 'pending-contracts';
};

export async function getSafarSdk(): Promise<PendingSdk> {
  return { status: 'pending-contracts' };
}

export function assertSdkReady() {
  throw new Error('safar-sdk.js integration is pending shared/contracts.json from Dev 1.');
}
