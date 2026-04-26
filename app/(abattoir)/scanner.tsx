/**
 * Abattoir — Scanner Screen
 * Camera placeholder + manual entry to scan lot QR.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getEligibility } from '@/services/api';

export default function ScannerScreen() {
  const [lotId, setLotId] = useState('');
  const [rxId, setRxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!lotId.trim() || !rxId.trim()) { setError('Entrez le Lot ID et le Rx ID'); return; }
    setError(''); setLoading(true);
    try {
      const res = await getEligibility(lotId.trim(), rxId.trim());
      if (res.eligible) {
        router.push({ pathname: '/(abattoir)/result-eligible', params: { lotId: res.lotId, rxId: rxId.trim(), daysRemaining: String(res.daysRemaining) } } as any);
      } else {
        router.push({ pathname: '/(abattoir)/result-rejected', params: { lotId: res.lotId, daysRemaining: String(res.daysRemaining) } } as any);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur de vérification');
    } finally { setLoading(false); }
  };

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
        <Text style={s.cameraText}>Placez le QR code dans le cadre</Text>
        <View style={s.scanLine} />
      </View>

      <View style={s.bottomPanel}>
        <Text style={s.panelTitle}>Saisie manuelle</Text>
        <View style={s.inputRow}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="Lot ID" placeholderTextColor={Colors.outline} value={lotId} onChangeText={setLotId} />
        </View>
        <View style={[s.inputRow, { marginTop: Spacing.sm }]}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="Rx ID (prescription)" placeholderTextColor={Colors.outline} value={rxId} onChangeText={setRxId} />
        </View>
        {!!error && <Text style={{ color: Colors.onErrorContainer, fontSize: 13, marginTop: Spacing.sm }}>⚠️ {error}</Text>}
        <TouchableOpacity style={[s.scanBtn, { marginTop: Spacing.md }, loading && { opacity: 0.7 }]} onPress={handleScan} activeOpacity={0.85} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={s.scanBtnText}>Vérifier l'éligibilité</Text>}
        </TouchableOpacity>
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
