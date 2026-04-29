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
import { ArrowLeft, AlertTriangle, ScanLine } from 'lucide-react-native';

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header inside camera view area */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner le Lot</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.cameraView}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <ScanLine size={64} color="rgba(255,255,255,0.2)" />
        </View>
        <Text style={styles.cameraText}>Placez le QR code dans le cadre</Text>
        <View style={styles.scanLine} />
      </View>

      <View style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>Saisie manuelle</Text>
        
        <Text style={styles.label}>Lot ID</Text>
        <View style={styles.inputRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder="Ex: LOT-1234" 
            placeholderTextColor={Colors.onSurfaceVariant} 
            value={lotId} 
            onChangeText={setLotId} 
          />
        </View>
        
        <Text style={styles.label}>Rx ID (Prescription)</Text>
        <View style={styles.inputRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder="Ex: RX-9876" 
            placeholderTextColor={Colors.onSurfaceVariant} 
            value={rxId} 
            onChangeText={setRxId} 
          />
        </View>
        
        {!!error && (
          <View style={styles.errorBox}>
            <AlertTriangle size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <TouchableOpacity style={[styles.scanBtn, loading && { opacity: 0.7 }]} onPress={handleScan} activeOpacity={0.85} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.scanBtnText}>Vérifier l'éligibilité</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  topHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },

  cameraView: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  scanFrame: { 
    width: 260, height: 260, position: 'relative', 
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: Colors.primary, borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },
  scanLine: { position: 'absolute', width: 260, height: 2, backgroundColor: Colors.primary, opacity: 0.8, top: '50%' },
  cameraText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: Spacing.xl },
  
  bottomPanel: { 
    backgroundColor: Colors.background, 
    borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, 
    padding: Spacing.xl, paddingBottom: 40,
    ...Shadows.lg,
  },
  panelTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface, marginBottom: Spacing.md },
  
  label: { 
    fontSize: 13, fontWeight: '700', color: Colors.onSurfaceVariant, 
    textTransform: 'uppercase', letterSpacing: 0.5, 
    marginBottom: Spacing.xs, marginTop: Spacing.md 
  },
  
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { 
    flex: 1, 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.md, paddingVertical: 16, 
    fontSize: 16, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.outline,
  },
  
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.error + '1A',
    borderRadius: Radii.md, padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  errorText: { fontSize: 14, color: Colors.error, fontWeight: '500', flex: 1 },

  scanBtn: { 
    backgroundColor: Colors.primary, 
    borderRadius: Radii.full, 
    paddingVertical: 18, 
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md
  },
  scanBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
