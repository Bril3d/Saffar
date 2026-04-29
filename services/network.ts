import NetInfo from '@react-native-community/netinfo';

export async function isOnline() {
  const state = await NetInfo.fetch();

  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export function onReconnect(callback: () => void | Promise<void>) {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      callback();
    }
  });
}
