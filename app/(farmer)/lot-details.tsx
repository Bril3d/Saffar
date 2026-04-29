/**
 * Farmer — Lot Details (Traceability)
 * Displays the full lifecycle of a specific lot for the farmer.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getTraceability, confirmPrescription } from '@/services/api';
import type { TraceResponse } from '@/services/types';
import { Tractor, Pill, Clock, Factory, CheckCircle2, ArrowLeft } from 'lucide-react-native';

export default function LotDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingRxId, setConfirmingRxId] = useState<string | null>(null);

  const loadTrace = () => {
    if (params.id) {
      setLoading(true);
      getTraceability(params.id).then(setTrace).catch(() => setTrace(null)).finally(() => setLoading(false));
    } else { setLoading(false); }
  };

  useEffect(() => {
    loadTrace();
  }, [params.id]);

  const handleConfirmRx = async (rxId: string) => {
    setConfirmingRxId(rxId);
    try {
      await confirmPrescription(rxId);
      loadTrace();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Erreur lors de la confirmation');
    } finally {
      setConfirmingRxId(null);
    }
  };

  const traceSteps = trace ? [
    ...(trace.lotCreation ? [{ icon: Tractor, color: Colors.primary, label: 'Création du lot', detail: `${trace.lotCreation.name} (${trace.lotCreation.species || 'Bovin'}) - ${trace.lotCreation.quantity || 1} tête(s)`, date: new Date(trace.lotCreation.createdAt).toLocaleDateString('fr-FR') }] : []),
    ...trace.prescriptions.flatMap((rx) => {
        const events = [];
        events.push({
          icon: Pill,
          color: rx.administered ? Colors.success : Colors.status.pending,
          label: rx.administered ? 'Traitement administré' : 'Prescription',
          detail: `${rx.antibiotic} · ${rx.awareClass}`,
          date: rx.treatmentStart ? new Date(rx.treatmentStart).toLocaleDateString('fr-FR') : '',
          action: !rx.administered ? { rxId: rx.rxId, label: 'Confirmer l\'administration' } : null
        });
        if (rx.withdrawalEnd) {
          events.push({
            icon: Clock,
            color: Colors.warning,
            label: 'Fin délai d\'attente',
            detail: 'Abattage autorisé à partir de cette date',
            date: new Date(rx.withdrawalEnd).toLocaleDateString('fr-FR'),
          });
        }
        return events;
    }),
    ...(trace.certification.certified ? [{ icon: Factory, color: Colors.success, label: 'Abattage & Certifié', detail: `Score: ${trace.trustScore}%`, date: trace.certification.certifiedAt ? new Date(trace.certification.certifiedAt).toLocaleDateString('fr-FR') : '' }] : []),
  ] : [];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <ArrowLeft size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Détails du Lot</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} /> :
          !trace ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 40 }}>Aucune donnée pour ce lot</Text> : <>
            
            <View style={s.productBanner}>
              <View style={{ flex: 1 }}>
                <Text style={s.productName}>{trace.lotCreation?.name || `Lot ${trace.lotId}`}</Text>
                <Text style={s.productLot}>{trace.lotCreation?.species || 'Espèce inconnue'} • {trace.prescriptions.length} traitement(s)</Text>
              </View>
              <View style={s.trustCircle}><Text style={s.trustText}>{trace.trustScore}</Text></View>
            </View>

            {trace.lotDetails?.inWithdrawal && (
              <View style={s.warningBanner}>
                <Clock size={20} color="#F57F17" />
                <Text style={s.warningText}>Lot en période de retrait. Non éligible à l'abattage.</Text>
              </View>
            )}

            <View style={s.chainBadge}>
              <View style={s.chainDot} />
              <Text style={s.chainText}>{trace.verifiedOnBlockchain ? 'Vérifié on-chain' : 'Non vérifié'}</Text>
            </View>

            {traceSteps.map((step, i) => {
              const IconComp = step.icon;
              return (
              <View key={i} style={s.timelineItem}>
                <View style={s.timelineLeft}>
                  <View style={[s.timelineDot, { backgroundColor: step.color + '20' }]}>
                    <IconComp size={18} color={step.color} />
                  </View>
                  {i < traceSteps.length - 1 && <View style={s.timelineLine} />}
                </View>
                <View style={s.timelineContent}>
                  <Text style={s.stepLabel}>{step.label}</Text>
                  <Text style={s.stepDetail}>{step.detail}</Text>
                  <Text style={s.stepDate}>{step.date}</Text>
                  
                  {step.action && (
                    <TouchableOpacity 
                      style={[s.confirmBtn, confirmingRxId === step.action.rxId && { opacity: 0.7 }]} 
                      onPress={() => handleConfirmRx(step.action.rxId)}
                      disabled={confirmingRxId === step.action.rxId}
                      activeOpacity={0.8}
                    >
                      {confirmingRxId === step.action.rxId ? (
                        <ActivityIndicator size="small" color={Colors.onPrimary} />
                      ) : (
                        <Text style={s.confirmBtnText}>{step.action.label}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              );
            })}

            {trace.certification.certified && (
              <TouchableOpacity
                style={s.publishBtn}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(farmer)/publish-product', params: { prefillLotId: trace.lotId } } as any)}
              >
                <CheckCircle2 size={20} color={Colors.onPrimary} />
                <Text style={s.publishBtnText}>Vendre sur le Marketplace</Text>
              </TouchableOpacity>
            )}
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  productBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.xl, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  productName: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  productLot: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  trustCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  trustText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FFF8E1', borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  warningText: { fontSize: 13, color: '#F57F17', fontWeight: '600' },
  chainBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryFixed, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.full, alignSelf: 'flex-start', marginBottom: Spacing.xl },
  chainDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  chainText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  timelineItem: { flexDirection: 'row', minHeight: 90 },
  timelineLeft: { width: 44, alignItems: 'center' },
  timelineDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.primaryFixedDim, marginVertical: 4 },
  timelineContent: { flex: 1, paddingLeft: Spacing.md, paddingBottom: Spacing.lg },
  stepLabel: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  stepDetail: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  stepDate: { fontSize: 11, color: Colors.outline, marginTop: 4 },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 10, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.md, alignSelf: 'flex-start',
  },
  confirmBtnText: { color: Colors.onPrimary, fontSize: 13, fontWeight: '700' },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: Radii.full,
    paddingVertical: 16, marginTop: Spacing.xl, ...Shadows.md
  },
  publishBtnText: { fontSize: 16, fontWeight: '700', color: Colors.onPrimary },
});
