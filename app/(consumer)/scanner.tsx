/**
 * Consumer — QR Scanner Screen
 * Scan a product QR to see its full traceability.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

export default function ConsumerScannerScreen() {
  const [code, setCode] = useState('');

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />
      <View style={s.cameraView}>
        <View style={s.scanFrame}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </View>
        <Text style={s.cameraText}>Scannez le QR code du produit</Text>
        <View style={s.scanLine} />
      </View>

      <View style={s.bottomPanel}>
        <Text style={s.panelTitle}>Vérifier un produit</Text>
        <Text style={s.panelSubtitle}>Scannez ou saisissez l'identifiant pour accéder à l'historique complet du produit sur la blockchain</Text>
        <View style={s.inputRow}>
          <TextInput style={s.input} placeholder="ID produit (ex: PROD-1234)" placeholderTextColor={Colors.outline} value={code} onChangeText={setCode} />
          <TouchableOpacity style={s.scanBtn} onPress={() => router.push('/(consumer)/traceability')} activeOpacity={0.85}>
            <Text style={s.scanBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}><Text style={s.closeBtnText}>← Retour</Text></TouchableOpacity>
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
  panelTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface, marginBottom: 4 },
  panelSubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.md, lineHeight: 18 },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  scanBtn: { width: 52, backgroundColor: Colors.primaryContainer, borderRadius: Radii.lg, alignItems: 'center', justifyContent: 'center', ...Shadows.glow(Colors.primaryContainer) },
  scanBtnText: { fontSize: 22 },
  closeBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
