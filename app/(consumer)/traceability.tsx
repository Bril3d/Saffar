/**
 * Consumer — Traceability Screen
 * Full on-chain traceability timeline for a product.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const traceSteps = [
  { icon: '💊', label: 'Vente Pharmacie', detail: 'Amoxicilline 500mg · J01CA04', actor: 'Pharmacie Centrale', date: '18 Avr 2026', txHash: '0x7f3a…1234' },
  { icon: '📋', label: 'Prescription Vétérinaire', detail: 'Dr. Ben Ali · 10mg/kg, 2x/jour', actor: 'Cabinet Vétérinaire Ben Ali', date: '18 Avr 2026', txHash: '0x8b2c…5678' },
  { icon: '💉', label: 'Administration Confirmée', detail: 'Ferme El Baraka · Lot #1234', actor: 'Éleveur Mohamed', date: '19 Avr 2026', txHash: '0x9d4e…9abc' },
  { icon: '⏳', label: 'Période de Retrait', detail: '5 jours requis · 8 jours effectués', actor: 'Smart Contract', date: '19-27 Avr 2026', txHash: '0xa1f0…def0' },
  { icon: '✅', label: 'Certification', detail: 'Lot éligible · Score 98%', actor: 'Smart Contract Auto', date: '27 Avr 2026', txHash: '0xb3g2…1111' },
  { icon: '🔪', label: 'Contrôle Abattoir', detail: 'Scan QR · Éligible confirmé', actor: 'Abattoir Manouba', date: '28 Avr 2026', txHash: '0xc5h4…2222' },
];

export default function TraceabilityScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Traçabilité</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Product banner */}
        <View style={s.productBanner}>
          <Text style={s.productEmoji}>🐔</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.productName}>Poulet Fermier Bio</Text>
            <Text style={s.productLot}>Lot #1234 · Ferme El Baraka</Text>
          </View>
          <View style={s.trustCircle}><Text style={s.trustText}>98</Text></View>
        </View>

        {/* Blockchain badge */}
        <View style={s.chainBadge}>
          <View style={s.chainDot} />
          <Text style={s.chainText}>6 transactions vérifiées on-chain</Text>
        </View>

        {/* Timeline */}
        {traceSteps.map((step, i) => (
          <View key={i} style={s.timelineItem}>
            <View style={s.timelineLeft}>
              <View style={s.timelineDot}><Text style={s.dotEmoji}>{step.icon}</Text></View>
              {i < traceSteps.length - 1 && <View style={s.timelineLine} />}
            </View>
            <View style={s.timelineContent}>
              <Text style={s.stepLabel}>{step.label}</Text>
              <Text style={s.stepDetail}>{step.detail}</Text>
              <Text style={s.stepActor}>{step.actor}</Text>
              <View style={s.stepFooter}>
                <Text style={s.stepDate}>{step.date}</Text>
                <Text style={s.stepHash}>{step.txHash}</Text>
              </View>
            </View>
          </View>
        ))}
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
