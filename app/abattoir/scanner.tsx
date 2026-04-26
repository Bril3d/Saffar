import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, PageHeader, PrimaryButton, Screen } from '@/components/app-ui';
import { getEligibility } from '@/services/api';

function decodeLotId(data: string) {
  return data.match(/L-\d+/i)?.[0].toUpperCase() ?? data.trim();
}

export default function AbattoirScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (scanned) {
      return;
    }

    setScanned(true);
    const lotId = decodeLotId(data);
    const result = await getEligibility(lotId);

    router.replace({
      pathname: result.eligible ? '/abattoir/result-eligible' : '/abattoir/result-rejected',
      params: {
        daysRemaining: String(result.daysRemaining),
        lotId,
        txHash: result.txHash,
      },
    });
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
          <Text style={styles.copy}>La camera est necessaire pour scanner un QR de lot.</Text>
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
        <Text style={styles.title}>Scanner QR lot</Text>
        <Text style={styles.copy}>Alignez le QR dans le cadre.</Text>
        {scanned ? <ActivityIndicator color="#ffffff" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: '#475569',
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
