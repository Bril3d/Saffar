/**
 * Consumer — Traceability Screen
 * Full on-chain traceability timeline for a product.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getTraceability } from '@/services/api';
import type { TraceResponse } from '@/services/types';

export default function TraceabilityScreen() {
  const params = useLocalSearchParams<{ lotId: string }>();
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.lotId) {
      getTraceability(params.lotId).then(setTrace).catch(() => setTrace(null)).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [params.lotId]);

  const traceSteps = trace ? [
    ...trace.prescriptions.map((rx, i) => ({
      icon: i === 0 ? '💊' : '💉',
      label: rx.administered ? 'Traitement administré' : 'Prescription',
      detail: `${rx.antibiotic} · ${rx.awareClass}`,
      date: rx.treatmentStart ? new Date(rx.treatmentStart).toLocaleDateString('fr-FR') : '',
    })),
    ...(trace.certification.certified ? [{ icon: '✅', label: 'Certifié', detail: `Score: ${trace.trustScore}%`, date: trace.certification.certifiedAt ? new Date(trace.certification.certifiedAt).toLocaleDateString('fr-FR') : '' }] : []),
  ] : [];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Traçabilité</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} /> :
          !trace ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 40 }}>Aucune donnée de traçabilité</Text> : <>
            <View style={s.productBanner}>
              <Text style={s.productEmoji}>🐔</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.productName}>Lot {trace.lotId}</Text>
                <Text style={s.productLot}>{trace.prescriptions.length} traitement(s)</Text>
              </View>
              <View style={s.trustCircle}><Text style={s.trustText}>{trace.trustScore}</Text></View>
            </View>

            <View style={s.infoCard}>
              <Text style={s.infoTitle}>Traceabilite Vet <-> Farmer</Text>
              <Text style={s.infoText}>Veterinaires lies: {trace.farmerVetTraceability?.distinctVeterinarians ?? 0}</Text>
              <Text style={s.infoText}>Eleveurs lies: {trace.farmerVetTraceability?.distinctFarmers ?? 0}</Text>
              <Text style={s.infoText}>Retrait actif: {trace.lotDetails?.inWithdrawal ? 'Oui' : 'Non'}</Text>
              {!!trace.certification?.txHash && (
                <Text style={s.infoHash}>Tx: {trace.certification.txHash.slice(0, 10)}...{trace.certification.txHash.slice(-6)}</Text>
              )}
            </View>

            <View style={s.chainBadge}>
              <View style={s.chainDot} />
              <Text style={s.chainText}>{trace.verifiedOnBlockchain ? 'Vérifié on-chain' : 'Non vérifié'}</Text>
            </View>

            {traceSteps.map((step, i) => (
              <View key={i} style={s.timelineItem}>
                <View style={s.timelineLeft}>
                  <View style={s.timelineDot}><Text style={s.dotEmoji}>{step.icon}</Text></View>
                  {i < traceSteps.length - 1 && <View style={s.timelineLine} />}
                </View>
                <View style={s.timelineContent}>
                  <Text style={s.stepLabel}>{step.label}</Text>
                  <Text style={s.stepDetail}>{step.detail}</Text>
                  <Text style={s.stepDate}>{step.date}</Text>
                </View>
              </View>
            ))}
          </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.onSurface },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  productBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.xl, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  productEmoji: { fontSize: 36 },
  productName: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  productLot: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  trustCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  trustText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  infoCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md },
  infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.onSurface, marginBottom: 6 },
  infoText: { fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 2 },
  infoHash: { fontSize: 11, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  chainBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryFixed, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.full, alignSelf: 'flex-start', marginBottom: Spacing.xl },
  chainDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  chainText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  timelineItem: { flexDirection: 'row', minHeight: 90 },
  timelineLeft: { width: 44, alignItems: 'center' },
  timelineDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  dotEmoji: { fontSize: 18 },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.primaryFixedDim, marginVertical: 4 },
  timelineContent: { flex: 1, paddingLeft: Spacing.md, paddingBottom: Spacing.lg },
  stepLabel: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  stepDetail: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  stepActor: { fontSize: 12, fontWeight: '600', color: Colors.primary, marginTop: 4 },
  stepFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stepDate: { fontSize: 11, color: Colors.outline },
  stepHash: { fontSize: 10, fontFamily: 'monospace', color: Colors.outline },
});
