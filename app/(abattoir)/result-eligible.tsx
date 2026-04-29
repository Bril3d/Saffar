/**
 * Abattoir — Result: Eligible
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { certifyLot } from '@/services/api';

export default function ResultEligibleScreen() {
  const params = useLocalSearchParams<{ lotId: string; rxId: string; daysRemaining: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCertify = async () => {
    setLoading(true); setError('');
    try {
      await certifyLot(params.lotId, params.rxId);
      router.replace('/(abattoir)/home');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Résultat du scan</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.heroCard}>
          <View style={s.heroCircle}><Text style={s.heroIcon}></Text></View>
          <Text style={s.heroTitle}>ÉLIGIBLE</Text>
          <Text style={s.heroSubtitle}>Ce lot peut être abattu en toute sécurité</Text>
        </View>

        <View style={s.detailCard}>
          <View style={s.row}><Text style={s.lbl}>Lot</Text><Text style={s.val}>{params.lotId}</Text></View>
          <View style={s.row}><Text style={s.lbl}>Prescription</Text><Text style={s.val}>{params.rxId}</Text></View>
          <View style={s.row}><Text style={s.lbl}>Jours restants</Text><Text style={s.val}>{params.daysRemaining} jours </Text></View>
        </View>

        {!!error && <Text style={{ color: Colors.onErrorContainer, textAlign: 'center', marginTop: Spacing.md }}>️ {error}</Text>}

        <TouchableOpacity style={[s.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleCertify} activeOpacity={0.85} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={s.primaryBtnText}>Confirmer l'abattage</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => router.replace('/(abattoir)/scanner')}>
          <Text style={s.ghostBtnText}>Scanner un autre lot</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.onSurface },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  heroCard: { backgroundColor: '#E8F5E9', borderRadius: Radii.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  heroCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  heroIcon: { fontSize: 40 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: Colors.status.certified, letterSpacing: 1 },
  heroSubtitle: { fontSize: 14, color: Colors.onSurface, marginTop: Spacing.sm, textAlign: 'center' },
  detailCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.xl, padding: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  lbl: { fontSize: 13, color: Colors.onSurfaceVariant },
  val: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  hashCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginTop: Spacing.md },
  hashLabel: { fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  hashValue: { fontSize: 13, fontFamily: 'monospace', color: Colors.onSurface },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, ...Shadows.glow(Colors.primary) },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
  ghostBtn: { marginTop: Spacing.md, alignItems: 'center', paddingVertical: 14 },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
