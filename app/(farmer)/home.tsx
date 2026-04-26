/**
 * SAFAR Chain — Farmer (Éleveur) Home Screen
 * Withdrawal alerts, lot cards with status, offline indicator.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const stats = [
  { value: '8', label: 'Lots actifs', color: Colors.onSurfaceVariant },
  { value: '3', label: 'Certifiés ✅', color: Colors.status.certified },
  { value: '2', label: 'En retrait ⏳', color: Colors.status.withdrawal },
];

const lots = [
  {
    id: '#1234',
    name: 'Poulets de chair',
    status: 'certified' as const,
    daysRemaining: 0,
  },
  {
    id: '#1235',
    name: 'Oeufs',
    status: 'withdrawal' as const,
    daysRemaining: 3,
  },
  {
    id: '#1236',
    name: 'Bovins',
    status: 'pending' as const,
    daysRemaining: 0,
  },
];

const statusCfg = {
  certified: { label: 'Certifié', color: Colors.status.certified, bg: '#E8F5E9' },
  withdrawal: { label: 'En retrait', color: Colors.status.withdrawal, bg: '#FFF8E1' },
  pending: { label: 'En attente', color: Colors.status.pending, bg: '#F5F5F5' },
};

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LotCard({ id, name, status, daysRemaining }: typeof lots[0]) {
  const cfg = statusCfg[status];
  return (
    <View style={[styles.lotCard, { borderLeftColor: cfg.color }]}>
      <View style={styles.lotHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.lotId}>Lot {id}</Text>
          <Text style={styles.lotName}>{name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {daysRemaining > 0 && (
            <Text style={styles.countdown}>J-{daysRemaining}</Text>
          )}
        </View>
      </View>
      {status === 'certified' && (
        <TouchableOpacity style={styles.publishBtn} activeOpacity={0.8} onPress={() => router.push('/(farmer)/publish-product')}>
          <Text style={styles.publishBtnText}>Publier produit →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function FarmerHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Offline bar */}
      <View style={styles.offlineBar}>
        <Text style={styles.offlineText}>📶 Hors connexion · 2 actions en attente</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🐄</Text>
            <Text style={styles.headerTitle}>Éleveur</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>E</Text>
            </View>
          </View>
        </View>

        {/* Alert banner */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>2 lots en période de retrait</Text>
            <Text style={styles.alertSubtitle}>Vérifiez les délais avant publication</Text>
          </View>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </ScrollView>

        {/* Filter chips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Lots</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {['Tous', 'Certifiés', 'En retrait', 'En attente'].map((c, i) => (
            <TouchableOpacity key={i} style={[styles.chip, i === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lots */}
        {lots.map((lot, i) => <LotCard key={i} {...lot} />)}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => router.push('/(farmer)/confirm-admin')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(farmer)/lots')}>
          <Text style={styles.tabIcon}>🐔</Text>
          <Text style={styles.tabLabel}>Mes Lots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(farmer)/farmer-sales')}>
          <Text style={styles.tabIcon}>🛒</Text>
          <Text style={styles.tabLabel}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(farmer)/profile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 120 },

  // Offline bar
  offlineBar: {
    backgroundColor: Colors.status.withdrawal + '20',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  offlineText: { fontSize: 12, fontWeight: '600', color: Colors.status.withdrawal },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: { fontSize: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.onPrimary },

  // Alert
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  alertIcon: { fontSize: 24 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#F57F17' },
  alertSubtitle: { fontSize: 12, color: '#F9A825', marginTop: 2 },

  // Stats
  statsRow: { gap: Spacing.sm, paddingBottom: Spacing.sm, marginBottom: Spacing.md },
  statCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, minWidth: 110, ...Shadows.sm },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2, fontWeight: '500' },

  // Section
  sectionHeader: { marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },

  // Chips
  chipRow: { gap: Spacing.sm, marginBottom: Spacing.lg },
  chip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.primaryContainer },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },

  // Lot cards
  lotCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  lotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  lotId: { fontSize: 13, fontWeight: '700', color: Colors.onSurfaceVariant },
  lotName: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  countdown: { fontSize: 13, fontWeight: '800', color: Colors.status.withdrawal },
  publishBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary + '12',
    borderRadius: Radii.full,
    paddingVertical: 8,
    alignItems: 'center',
  },
  publishBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow(Colors.primaryContainer),
  },
  fabIcon: { fontSize: 28, fontWeight: '300', color: Colors.onPrimary },

  // Tab Bar
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around',
  },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
