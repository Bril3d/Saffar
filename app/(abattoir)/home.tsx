/**
 * SAFAR Chain — Abattoir Home Screen
 * Today's stats, hero scanner CTA, recent scans.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const stats = [
  { value: '24', label: 'Lots vérifiés', color: Colors.onSurfaceVariant },
  { value: '20', label: 'Éligibles', color: Colors.status.certified },
  { value: '4', label: 'Rejetés', color: Colors.status.rejected },
];

const recentScans = [
  { lot: 'Lot #1234', farm: 'Ferme El Baraka', result: 'eligible' as const, time: 'Il y a 12 min' },
  { lot: 'Lot #1235', farm: 'Ferme Sidi Bou', result: 'rejected' as const, time: 'Il y a 45 min' },
  { lot: 'Lot #1236', farm: 'Ferme Al Waha', result: 'eligible' as const, time: 'Il y a 1h' },
];

export default function AbattoirHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={{ fontSize: 24 }}>🔪</Text>
            <Text style={styles.headerTitle}>Abattoir</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}><Text style={{ fontSize: 18 }}>🔔</Text></TouchableOpacity>
            <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
          </View>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Hero Scanner CTA */}
        <TouchableOpacity style={styles.scannerHero} activeOpacity={0.85} onPress={() => router.push('/(abattoir)/scanner')}>
          <View style={styles.scannerGlow}>
            <Text style={styles.scannerIcon}>📷</Text>
          </View>
          <Text style={styles.scannerTitle}>Scanner un Lot</Text>
          <Text style={styles.scannerSubtitle}>Vérifier l'éligibilité via blockchain</Text>
        </TouchableOpacity>

        {/* Recent Scans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scans Récents</Text>
          <TouchableOpacity onPress={() => router.push('/(abattoir)/history')}><Text style={styles.seeAllLink}>Voir tout</Text></TouchableOpacity>
        </View>

        {recentScans.map((scan, i) => (
          <View key={i} style={styles.scanCard}>
            <View style={styles.scanLeft}>
              <View style={[styles.scanDot, { backgroundColor: scan.result === 'eligible' ? Colors.status.certified : Colors.status.rejected }]} />
              <View>
                <Text style={styles.scanLot}>{scan.lot}</Text>
                <Text style={styles.scanFarm}>{scan.farm}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={[styles.resultBadge, {
                backgroundColor: scan.result === 'eligible' ? '#E8F5E9' : '#FFEBEE',
              }]}>
                <Text style={[styles.resultText, {
                  color: scan.result === 'eligible' ? Colors.status.certified : Colors.status.rejected,
                }]}>
                  {scan.result === 'eligible' ? '✅ Éligible' : '❌ Rejeté'}
                </Text>
              </View>
              <Text style={styles.scanTime}>{scan.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabIconActive}>🏠</Text><Text style={styles.tabLabelActive}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(abattoir)/scanner')}><Text style={styles.tabIcon}>📷</Text><Text style={styles.tabLabel}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(abattoir)/history')}><Text style={styles.tabIcon}>📋</Text><Text style={styles.tabLabel}>Historique</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(abattoir)/profile')}><Text style={styles.tabIcon}>👤</Text><Text style={styles.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.onPrimary },

  statsRow: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  statCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, minWidth: 110, ...Shadows.sm },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2, fontWeight: '500' },

  // Scanner hero
  scannerHero: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    marginVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.glow(Colors.primaryContainer),
  },
  scannerGlow: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  scannerIcon: { fontSize: 36 },
  scannerTitle: { fontSize: 20, fontWeight: '800', color: Colors.onPrimary },
  scannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  seeAllLink: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  scanCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.sm,
  },
  scanLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scanDot: { width: 10, height: 10, borderRadius: 5 },
  scanLot: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  scanFarm: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  resultText: { fontSize: 11, fontWeight: '700' },
  scanTime: { fontSize: 10, color: Colors.outline, marginTop: 4 },

  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
