import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, Card, PageHeader, Screen } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';

function decodeLotId(data: string) {
  return data.match(/L-\d+/i)?.[0].toUpperCase() ?? data.trim();
}

export default function ConsumerScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    router.replace({ pathname: '/consumer/traceability', params: { lotId: decodeLotId(data) } });
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
          <Text style={styles.copy}>La camera est necessaire pour scanner le QR produit.</Text>
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
        <Text style={styles.title}>Scanner QR produit</Text>
        <Text style={styles.copy}>Le scan ouvre la trace publique du lot.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    ...typography.body,
    color: colors.text.primary,
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
