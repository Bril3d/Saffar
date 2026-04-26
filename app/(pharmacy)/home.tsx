/**
 * SAFAR Chain — Pharmacy Home Screen
 * Stats row, "Nouvelle Vente" hero CTA, recent sales list.
 * "Emerald Trace" design: white bg, green primary, tonal layering.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

/* ── Mock Data ───────────────────────────────────── */

const stats = [
  { value: '32', label: 'Ventes ce mois', color: Colors.primary },
  { value: '8', label: 'Vétérinaires actifs', color: Colors.secondary },
  { value: '156', label: 'Doses dispensées', color: Colors.onSurfaceVariant },
];

const recentSales = [
  {
    drug: 'Amoxicilline 500mg',
    atc: 'J01CA04',
    aware: 'Access' as const,
    vet: 'Dr. Ben Ali',
    date: '25 Avr 2026',
    txHash: '0x7f3a…e4b2',
  },
  {
    drug: 'Colistine 2MUI',
    atc: 'J01XB01',
    aware: 'Reserve' as const,
    vet: 'Dr. Trabelsi',
    date: '24 Avr 2026',
    txHash: '0x9c1d…f7a8',
  },
  {
    drug: 'Enrofloxacine 100mg',
    atc: 'J01MA90',
    aware: 'Watch' as const,
    vet: 'Dr. Mansouri',
    date: '23 Avr 2026',
    txHash: '0x2e5b…c3d1',
  },
];

const awareColors = {
  Access: Colors.aware.access,
  Watch: Colors.aware.watch,
  Reserve: Colors.aware.reserve,
};

/* ── Components ──────────────────────────────────── */

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AWaReBadge({ classification }: { classification: 'Access' | 'Watch' | 'Reserve' }) {
  const color = awareColors[classification];
  return (
    <View style={[styles.awareBadge, { backgroundColor: color + '18' }]}>
      <View style={[styles.awareDot, { backgroundColor: color }]} />
      <Text style={[styles.awareBadgeText, { color }]}>{classification}</Text>
    </View>
  );
}

function SaleItem({
  drug, atc, aware, vet, date, txHash,
}: typeof recentSales[0]) {
  return (
    <View style={styles.saleCard}>
      <View style={styles.saleHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.saleDrug}>{drug}</Text>
          <Text style={styles.saleAtc}>{atc}</Text>
        </View>
        <AWaReBadge classification={aware} />
      </View>
      <View style={styles.saleFooter}>
        <Text style={styles.saleDetail}>🩺 {vet}</Text>
        <Text style={styles.saleDetail}>📅 {date}</Text>
      </View>
      <Text style={styles.txHash}>{txHash}</Text>
    </View>
  );
}

/* ── Main Screen ──────────────────────────────────── */

export default function PharmacyHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🏥</Text>
            <Text style={styles.headerTitle}>Pharmacie</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>P</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {stats.map((s, i) => (
            <StatCard key={i} value={s.value} label={s.label} color={s.color} />
          ))}
        </ScrollView>

        {/* New Sale CTA */}
        <TouchableOpacity style={styles.heroCta} activeOpacity={0.85} onPress={() => router.push('/(pharmacy)/new-sale')}>
          <View style={styles.heroCtaContent}>
            <View style={styles.heroCtaIcon}>
              <Text style={styles.heroCtaPlusIcon}>+</Text>
            </View>
            <View>
              <Text style={styles.heroCtaTitle}>Nouvelle Vente</Text>
              <Text style={styles.heroCtaSubtitle}>Enregistrer une dispensation</Text>
            </View>
          </View>
          <Text style={styles.heroCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Recent Sales */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ventes Récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(pharmacy)/sales')}>
            <Text style={styles.seeAllLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recentSales.map((sale, i) => (
          <SaleItem key={i} {...sale} />
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(pharmacy)/sales')}>
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(pharmacy)/alerts')}>
          <Text style={styles.tabIcon}>🔔</Text>
          <Text style={styles.tabLabel}>Alertes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(pharmacy)/profile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ── Styles ───────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },

  // Stats
  statsRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  statCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    minWidth: 120,
    ...Shadows.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },

  // Hero CTA
  heroCta: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.glow(Colors.primaryContainer),
  },
  heroCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaPlusIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.onPrimary,
  },
  heroCtaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  heroCtaSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroCtaArrow: {
    fontSize: 22,
    color: Colors.onPrimary,
    fontWeight: '300',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Sale Cards
  saleCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  saleDrug: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  saleAtc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  saleFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  saleDetail: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  txHash: {
    fontSize: 11,
    fontFamily: Platform.OS === 'web' ? "'JetBrains Mono', monospace" : undefined,
    color: Colors.outline,
    marginTop: Spacing.xs,
  },

  // AWaRe Badge
  awareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  awareDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  awareBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 10,
    paddingBottom: 28,
    justifyContent: 'space-around',
    borderTopWidth: 0,
  },
  tab: {
    alignItems: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  tabLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
});


