/**
 * Consumer — Product Detail Screen
 * Full product info with trust score, AWaRe badge, traceability CTA.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

export default function ProductDetailScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Image placeholder */}
        <View style={s.imageBox}>
          <Text style={s.imageEmoji}>🐔</Text>
          <TouchableOpacity onPress={() => router.back()} style={s.floatBack}><Text style={s.backIcon}>←</Text></TouchableOpacity>
        </View>

        {/* Content */}
        <View style={s.content}>
          {/* Title & price */}
          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Poulet Fermier Bio</Text>
              <Text style={s.farm}>Ferme El Baraka</Text>
            </View>
            <Text style={s.price}>9.500 TND</Text>
          </View>

          {/* Trust Score */}
          <View style={s.trustCard}>
            <View style={s.trustLeft}>
              <View style={s.trustCircle}><Text style={s.trustValue}>98</Text></View>
              <View>
                <Text style={s.trustLabel}>Score de Confiance</Text>
                <Text style={s.trustSub}>Basé sur la traçabilité blockchain</Text>
              </View>
            </View>
          </View>

          {/* AWaRe Badge */}
          <View style={s.awareBadge}>
            <View style={[s.awareDot, { backgroundColor: Colors.aware.access }]} />
            <Text style={[s.awareText, { color: Colors.aware.access }]}>WHO AWaRe: Access ✅</Text>
            <Text style={s.awareDetail}>Antibiotiques à risque minimal</Text>
          </View>

          {/* Details */}
          <View style={s.detailCard}>
            <Text style={s.sectionTitle}>Informations</Text>
            <View style={s.row}><Text style={s.lbl}>Lot</Text><Text style={s.val}>#1234</Text></View>
            <View style={s.row}><Text style={s.lbl}>Lieu</Text><Text style={s.val}>Tunis, Manouba</Text></View>
            <View style={s.row}><Text style={s.lbl}>Certifié le</Text><Text style={s.val}>20 Avr 2026</Text></View>
            <View style={s.row}><Text style={s.lbl}>Retrait respecté</Text><Text style={[s.val, { color: Colors.status.certified }]}>✅ Oui (8/5 jours)</Text></View>
            <View style={s.row}><Text style={s.lbl}>Dernier contrôle</Text><Text style={s.val}>Amoxicilline, J01CA04</Text></View>
          </View>

          {/* Actions */}
          <TouchableOpacity style={s.traceBtn} onPress={() => router.push('/(consumer)/traceability')} activeOpacity={0.85}>
            <Text style={s.traceBtnIcon}>🔗</Text>
            <Text style={s.traceBtnText}>Voir la traçabilité complète</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.orderBtn} activeOpacity={0.85}>
            <Text style={s.orderBtnText}>🛒 Ajouter au panier</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  scroll: { paddingBottom: 40 },
  imageBox: { height: 220, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  imageEmoji: { fontSize: 80 },
  floatBack: { position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.onSurface },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  farm: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },
  price: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  trustCard: { backgroundColor: Colors.primaryFixed, borderRadius: Radii.xl, padding: Spacing.md, marginBottom: Spacing.md },
  trustLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trustCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  trustValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  trustLabel: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  trustSub: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  awareBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.aware.access + '12', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, flexWrap: 'wrap' },
  awareDot: { width: 8, height: 8, borderRadius: 4 },
  awareText: { fontSize: 14, fontWeight: '700' },
  awareDetail: { fontSize: 12, color: Colors.onSurfaceVariant, width: '100%', marginTop: 4 },
  detailCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  lbl: { fontSize: 13, color: Colors.onSurfaceVariant },
  val: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  traceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingVertical: 16, marginBottom: Spacing.md },
  traceBtnIcon: { fontSize: 16 },
  traceBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  orderBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', ...Shadows.glow(Colors.primaryContainer) },
  orderBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
