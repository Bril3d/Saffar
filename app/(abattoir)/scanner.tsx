/**
 * Abattoir — Scanner Screen
 * Camera placeholder + manual entry to scan lot QR.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

export default function ScannerScreen() {
  const [manualCode, setManualCode] = useState('');

  const handleScan = () => {
    // Simulate — real app would use expo-camera
    const isEligible = manualCode.endsWith('4') || manualCode.endsWith('6');
    router.push(isEligible ? '/(abattoir)/result-eligible' : '/(abattoir)/result-rejected');
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />

      {/* Camera viewport placeholder */}
      <View style={s.cameraView}>
        <View style={s.scanFrame}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </View>
        <Text style={s.cameraText}>Placez le QR code dans le cadre</Text>

        {/* Scan line animation placeholder */}
        <View style={s.scanLine} />
      </View>

      {/* Bottom panel */}
      <View style={s.bottomPanel}>
        <Text style={s.panelTitle}>Ou saisir manuellement</Text>
        <View style={s.inputRow}>
          <TextInput style={s.input} placeholder="Lot ID (ex: LOT-1234)" placeholderTextColor={Colors.outline} value={manualCode} onChangeText={setManualCode} />
          <TouchableOpacity style={s.scanBtn} onPress={handleScan} activeOpacity={0.85}>
            <Text style={s.scanBtnText}>Vérifier</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={s.closeBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  cameraView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: Colors.primary, borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  scanLine: { position: 'absolute', width: 240, height: 2, backgroundColor: Colors.primary, opacity: 0.7 },
  cameraText: { position: 'absolute', bottom: -40, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  bottomPanel: { backgroundColor: Colors.surfaceContainerLowest, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, padding: Spacing.lg, paddingBottom: 40 },
  panelTitle: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginBottom: Spacing.md },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  scanBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.lg, paddingHorizontal: 20, justifyContent: 'center', ...Shadows.glow(Colors.primaryContainer) },
  scanBtnText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimary },
  closeBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
