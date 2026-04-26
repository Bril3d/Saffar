/**
 * Vet — Prescription Detail Screen
 * Read-only view with status timeline.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const timelineSteps = [
  { label: 'Créée', status: 'done' as const, date: '22 Avr 2026' },
  { label: 'Administrée', status: 'done' as const, date: '23 Avr 2026' },
  { label: 'Retrait en cours', status: 'active' as const, date: 'J-3' },
  { label: 'Certifiée', status: 'pending' as const, date: '—' },
];

export default function PrescriptionDetailScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Prescription #P-1234</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info card */}
        <View style={s.infoCard}>
          <View style={s.infoRow}><Text style={s.infoLabel}>Animal</Text><Text style={s.infoValue}>Poulets de chair</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Éleveur</Text><Text style={s.infoValue}>Ferme El Baraka</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Médicament</Text><Text style={s.infoValue}>Amoxicilline 500mg</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Code ATC</Text><Text style={s.infoValue}>J01CA04</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>AWaRe</Text><View style={s.accessBadge}><Text style={s.accessText}>Access ✅</Text></View></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Posologie</Text><Text style={s.infoValue}>10mg/kg, 2x/jour, 5 jours</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Retrait</Text><Text style={s.infoValue}>5 jours</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Lot</Text><Text style={s.infoValue}>LOT-1234</Text></View>
        </View>

        {/* Status Timeline */}
        <Text style={s.sectionTitle}>Statut de la prescription</Text>
        <View style={s.timeline}>
          {timelineSteps.map((step, i) => (
            <View key={i} style={s.timelineItem}>
              <View style={s.timelineLeft}>
                <View style={[s.timelineDot, step.status === 'done' && s.dotDone, step.status === 'active' && s.dotActive, step.status === 'pending' && s.dotPending]} />
                {i < timelineSteps.length - 1 && <View style={[s.timelineLine, (step.status === 'done') && s.lineDone]} />}
              </View>
              <View style={s.timelineContent}>
                <Text style={[s.timelineLabel, step.status === 'active' && { color: Colors.primary, fontWeight: '700' }]}>{step.label}</Text>
                <Text style={s.timelineDate}>{step.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tx Hash */}
        <View style={s.hashCard}>
          <Text style={s.hashLabel}>Transaction Blockchain</Text>
          <Text style={s.hashValue}>0x7f3a9b2c…e4b2</Text>
        </View>
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
  infoCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.xl, padding: Spacing.lg, ...Shadows.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  accessBadge: { backgroundColor: Colors.aware.access + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.full },
  accessText: { fontSize: 12, fontWeight: '700', color: Colors.aware.access },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md },
  timeline: { paddingLeft: 4 },
  timelineItem: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.surfaceContainerHigh },
  dotDone: { backgroundColor: Colors.primary },
  dotActive: { backgroundColor: Colors.primary, borderWidth: 3, borderColor: Colors.primaryFixed },
  dotPending: { backgroundColor: Colors.surfaceContainerHigh },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.surfaceContainerHigh, marginVertical: 2 },
  lineDone: { backgroundColor: Colors.primaryFixedDim },
  timelineContent: { flex: 1, paddingLeft: Spacing.md, paddingBottom: Spacing.md },
  timelineLabel: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  timelineDate: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  hashCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginTop: Spacing.xl },
  hashLabel: { fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  hashValue: { fontSize: 13, fontFamily: 'monospace', color: Colors.onSurface },
});
