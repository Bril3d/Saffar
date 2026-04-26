import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, PageHeader, PrimaryButton, Screen } from '@/components/app-ui';

function decodeLotId(data: string) {
  return data.match(/L-\d+/i)?.[0].toUpperCase() ?? data.trim();
}

export default function ConsumerScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (scanned) {
      return;
    }

    setScanned(true);
    router.replace({ pathname: '/consumer/traceability', params: { lotId: decodeLotId(data) } });
  };

  if (!permission) {
    return (
      <Screen>
        <ActivityIndicator color="#166534" />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <PageHeader title="Autoriser camera" />
        <Card tone="amber">
          <Text style={styles.copy}>La camera est necessaire pour scanner le QR produit.</Text>
          <PrimaryButton onPress={requestPermission}>Autoriser</PrimaryButton>
        </Card>
      </Screen>
    );
  }

  return (
    <View style={styles.fullscreen}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Scanner QR produit</Text>
        <Text style={styles.copy}>Le scan ouvre la trace publique du lot.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: '#ffffff',
    lineHeight: 20,
  },
  fullscreen: {
    backgroundColor: '#0f172a',
    flex: 1,
  },
  overlay: {
    backgroundColor: '#00000099',
    borderRadius: 8,
    bottom: 32,
    gap: 8,
    left: 20,
    padding: 16,
    position: 'absolute',
    right: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
});
