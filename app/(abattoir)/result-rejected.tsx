/**
 * Abattoir — Result: Rejected
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

export default function ResultRejectedScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Résultat du scan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Result hero */}
        <View style={s.heroCard}>
          <View style={s.heroCircle}><Text style={s.heroIcon}></Text></View>
          <Text style={s.heroTitle}>NON ÉLIGIBLE</Text>
          <Text style={s.heroSubtitle}>Ce lot ne peut pas être abattu actuellement</Text>
        </View>

        {/* Reason */}
        <View style={s.reasonCard}>
          <Text style={s.reasonTitle}>️ Motif du rejet</Text>
          <Text style={s.reasonText}>La période de retrait n'est pas terminée. Le lot contient encore des résidus d'antibiotiques au-dessus du seuil autorisé.</Text>
        </View>

        {/* Detail */}
        <View style={s.detailCard}>
          <View style={s.row}><Text style={s.lbl}>Lot</Text><Text style={s.val}>#1235 · Bovins</Text></View>
          <View style={s.row}><Text style={s.lbl}>Éleveur</Text><Text style={s.val}>Ferme Sidi Bou</Text></View>
          <View style={s.row}><Text style={s.lbl}>Dernier traitement</Text><Text style={s.val}>Enrofloxacine · 24 Avr</Text></View>
          <View style={s.row}><Text style={s.lbl}>Retrait requis</Text><Text style={s.val}>14 jours</Text></View>
          <View style={s.row}><Text style={s.lbl}>Retrait réel</Text><Text style={[s.val, { color: Colors.status.rejected }]}>2 jours </Text></View>
          <View style={s.row}><Text style={s.lbl}>Jours restants</Text><Text style={[s.val, { color: Colors.status.withdrawal, fontWeight: '800' }]}>J-12</Text></View>
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/(abattoir)/scanner')} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Scanner un autre lot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => router.replace('/(abattoir)/home')}>
          <Text style={s.ghostBtnText}>Retour à l'accueil</Text>
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
  heroCard: { backgroundColor: '#FFEBEE', borderRadius: Radii.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  heroCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFCDD2', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  heroIcon: { fontSize: 40 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: Colors.status.rejected, letterSpacing: 1 },
  heroSubtitle: { fontSize: 14, color: Colors.onSurface, marginTop: Spacing.sm, textAlign: 'center' },
  reasonCard: { backgroundColor: '#FFF8E1', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  reasonTitle: { fontSize: 14, fontWeight: '700', color: '#E65100', marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#BF360C', lineHeight: 18 },
  detailCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.xl, padding: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  lbl: { fontSize: 13, color: Colors.onSurfaceVariant },
  val: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  primaryBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, ...Shadows.glow(Colors.primaryContainer) },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
  ghostBtn: { marginTop: Spacing.md, alignItems: 'center', paddingVertical: 14 },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
