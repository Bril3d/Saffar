import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, Card, PageHeader, Screen } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { getEligibility } from '@/services/api';

function decodeLotId(data: string) {
  return data.match(/L-\d+/i)?.[0].toUpperCase() ?? data.trim();
}

export default function AbattoirScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
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
        <ActivityIndicator color={colors.accent.primary} />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <PageHeader title="Autoriser camera" />
        <Card tone="warning">
          <Text style={styles.copy}>La camera est necessaire pour scanner un QR de lot.</Text>
          <Button onPress={requestPermission}>Autoriser</Button>
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
        {scanned ? <ActivityIndicator color={colors.text.primary} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    ...typography.body,
    color: colors.text.secondary,
  },
  fullscreen: {
    backgroundColor: colors.bg.primary,
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(12,15,20,0.85)',
    borderRadius: radii.lg,
    bottom: 32,
    gap: spacing.sm,
    left: spacing.xl,
    padding: spacing.lg,
    position: 'absolute',
    right: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
});
