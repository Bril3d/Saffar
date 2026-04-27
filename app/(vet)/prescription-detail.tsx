/**
 * Vet — Prescription Detail Screen
 * Fetches real data from GET /api/prescriptions/:rxId
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getPrescription } from '@/services/api';
import type { PrescriptionResponse } from '@/services/types';
import { ArrowLeft, CheckCircle2, Clock, Syringe, Shield, FileText } from 'lucide-react-native';

function deriveTimelineSteps(rx: PrescriptionResponse) {
  const wEnd = new Date(rx.withdrawal_end);
  const daysLeft = Math.max(0, Math.ceil((wEnd.getTime() - Date.now()) / 86400000));
  const inWithdrawal = rx.administered && wEnd.getTime() > Date.now();
  const completed = rx.administered && wEnd.getTime() <= Date.now();

  return [
    {
      label: 'Prescription créée',
      status: 'done' as const,
      date: rx.start_date ? new Date(rx.start_date).toLocaleDateString('fr-FR') : '—',
      icon: <FileText size={18} color={Colors.onPrimary} />,
    },
    {
      label: 'Traitement administré',
      status: rx.administered ? ('done' as const) : ('pending' as const),
      date: rx.admin_timestamp ? new Date(rx.admin_timestamp).toLocaleDateString('fr-FR') : '—',
      icon: <Syringe size={18} color={rx.administered ? Colors.onPrimary : Colors.outlineVariant} />,
    },
    {
      label: 'Délai de retrait',
      status: inWithdrawal ? ('active' as const) : completed ? ('done' as const) : ('pending' as const),
      date: inWithdrawal ? `J-${daysLeft} restant(s)` : rx.withdrawal_end ? new Date(rx.withdrawal_end).toLocaleDateString('fr-FR') : '—',
      icon: <Clock size={18} color={inWithdrawal ? '#FFF' : completed ? Colors.onPrimary : Colors.outlineVariant} />,
    },
    {
      label: 'Certifié & éligible',
      status: completed ? ('done' as const) : ('pending' as const),
      date: completed ? new Date(rx.withdrawal_end).toLocaleDateString('fr-FR') : '—',
      icon: <Shield size={18} color={completed ? Colors.onPrimary : Colors.outlineVariant} />,
    },
  ];
}

export default function PrescriptionDetailScreen() {
  const params = useLocalSearchParams<{ rxId: string }>();
  const [rx, setRx] = useState<PrescriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.rxId) {
      getPrescription(params.rxId)
        .then(setRx)
        .catch(() => setRx(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params.rxId]);

  const timelineSteps = rx ? deriveTimelineSteps(rx) : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail Prescription</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : !rx ? (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>Prescription introuvable</Text>
          </View>
        ) : (
          <>
            {/* Rx ID Badge */}
            <View style={styles.rxBadge}>
              <Text style={styles.rxBadgeText}>Rx {rx.rx_id?.slice(0, 12)}</Text>
            </View>

            {/* Info card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Informations</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lot animal</Text>
                <Text style={styles.infoValue}>#{rx.animal_lot_id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Diagnostic</Text>
                <Text style={styles.infoValue}>{rx.diagnosis}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Posologie</Text>
                <Text style={styles.infoValue}>{rx.dosage} mg/kg</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jours de retrait</Text>
                <Text style={styles.infoValue}>{rx.withdrawal_days} jours</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fin retrait</Text>
                <Text style={styles.infoValue}>{rx.withdrawal_end ? new Date(rx.withdrawal_end).toLocaleDateString('fr-FR') : '—'}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Administré</Text>
                <View style={[styles.statusPill, { backgroundColor: rx.administered ? Colors.success + '1A' : Colors.warning + '1A' }]}>
                  {rx.administered ? <CheckCircle2 size={14} color={Colors.success} /> : <Clock size={14} color={Colors.warning} />}
                  <Text style={[styles.statusPillText, { color: rx.administered ? Colors.success : Colors.warning }]}>
                    {rx.administered ? 'Confirmé' : 'En attente'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Timeline */}
            <Text style={styles.sectionTitle}>Progression</Text>
            <View style={styles.timeline}>
              {timelineSteps.map((step, i) => {
                const isDone = step.status === 'done';
                const isActive = step.status === 'active';
                return (
                  <View key={i} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot, 
                        isDone && styles.dotDone, 
                        isActive && styles.dotActive, 
                        !isDone && !isActive && styles.dotPending
                      ]}>
                        {step.icon}
                      </View>
                      {i < timelineSteps.length - 1 && (
                        <View style={[styles.timelineLine, isDone && styles.lineDone]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[
                        styles.timelineLabel, 
                        isActive && { color: Colors.primary, fontWeight: '800' },
                        isDone && { color: Colors.onSurface },
                        !isDone && !isActive && { color: Colors.outlineVariant },
                      ]}>{step.label}</Text>
                      <Text style={styles.timelineDate}>{step.date}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Tx Hash */}
            {rx.tx_hash && (
              <View style={styles.hashCard}>
                <Text style={styles.hashLabel}>Transaction Blockchain</Text>
                <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">{rx.tx_hash}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.outline,
    backgroundColor: Colors.surface,
  },
  backBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outline,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 40 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.md },
  emptyText: { color: Colors.onSurfaceVariant, fontSize: 15 },

  rxBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '1A',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radii.full,
    marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  rxBadgeText: { fontSize: 14, fontFamily: Fonts?.mono, fontWeight: '700', color: Colors.primary },

  infoCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.xl, padding: Spacing.lg, 
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.onSurface, marginBottom: Spacing.md },
  infoRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  infoLabel: { fontSize: 14, color: Colors.onSurfaceVariant },
  infoValue: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radii.full,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.lg },
  
  timeline: { paddingLeft: 4 },
  timelineItem: { flexDirection: 'row', minHeight: 80 },
  timelineLeft: { width: 44, alignItems: 'center' },
  timelineDot: { 
    width: 40, height: 40, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  dotDone: { backgroundColor: Colors.primary },
  dotActive: { backgroundColor: Colors.warning, borderWidth: 3, borderColor: '#FFF8E1' },
  dotPending: { backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outline },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.outline, marginVertical: 4 },
  lineDone: { backgroundColor: Colors.primary + '66' },
  timelineContent: { flex: 1, paddingLeft: Spacing.md, paddingBottom: Spacing.lg, paddingTop: 6 },
  timelineLabel: { fontSize: 16, fontWeight: '700' },
  timelineDate: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  
  hashCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.lg, 
    marginTop: Spacing.xl,
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  hashLabel: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  hashValue: { fontSize: 14, fontFamily: Fonts?.mono, color: Colors.primary, fontWeight: '600' },
});
