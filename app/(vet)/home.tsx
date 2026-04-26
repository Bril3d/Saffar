/**
 * SAFAR Chain — Veterinarian Home Screen
 * Stats, AI assistant card, new prescription CTA, active prescriptions.
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
  TextInput,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

/* ── Mock Data ───────────────────────────────────── */

const stats = [
  { value: '12', label: 'Prescriptions actives', color: Colors.primary },
  { value: '5', label: 'Fermes suivies', color: Colors.secondary },
  { value: '48', label: 'Doses restantes', color: Colors.onSurfaceVariant },
];

const prescriptions = [
  {
    animal: 'Poulets de chair',
    farm: 'Ferme El Baraka',
    drug: 'Amoxicilline 500mg',
    aware: 'Access' as const,
    status: 'withdrawal' as const,
    daysRemaining: 3,
  },
  {
    animal: 'Bovins laitiers',
    farm: 'Ferme Sidi Bou',
    drug: 'Enrofloxacine 100mg',
    aware: 'Watch' as const,
    status: 'certified' as const,
    daysRemaining: 0,
  },
  {
    animal: 'Ovins',
    farm: 'Ferme Al Waha',
    drug: 'Colistine 2MUI',
    aware: 'Reserve' as const,
    status: 'withdrawal' as const,
    daysRemaining: 7,
  },
];

const awareColors = {
  Access: Colors.aware.access,
  Watch: Colors.aware.watch,
  Reserve: Colors.aware.reserve,
};

const statusConfig = {
  withdrawal: { label: 'En retrait', color: Colors.status.withdrawal, bg: '#FFF8E1' },
  certified: { label: 'Certifié', color: Colors.status.certified, bg: '#E8F5E9' },
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

function AIAssistantCard() {
  return (
    <View style={styles.aiCard}>
      <View style={styles.aiHeader}>
        <Text style={styles.aiIcon}>🤖</Text>
        <Text style={styles.aiTitle}>Assistant IA Vétérinaire</Text>
      </View>
      <TextInput
        style={styles.aiInput}
        placeholder="Décrivez les symptômes..."
        placeholderTextColor={Colors.outline}
        multiline
        numberOfLines={2}
      />
      <View style={styles.aiBadge}>
        <View style={styles.aiBadgeDot} />
        <Text style={styles.aiBadgeText}>100% local · Ollama phi3:mini</Text>
      </View>
    </View>
  );
}

function PrescriptionCard({
  animal, farm, drug, aware, status, daysRemaining,
}: typeof prescriptions[0]) {
  const statusCfg = statusConfig[status];
  const awareColor = awareColors[aware];

  return (
    <View style={[styles.prescriptionCard, { borderLeftColor: statusCfg.color }]}>
      <View style={styles.prescriptionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.prescriptionAnimal}>{animal}</Text>
          <Text style={styles.prescriptionFarm}>{farm}</Text>
        </View>
        {daysRemaining > 0 && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>J-{daysRemaining}</Text>
          </View>
        )}
      </View>
      <View style={styles.prescriptionFooter}>
        <Text style={styles.prescriptionDrug}>{drug}</Text>
        <View style={styles.badgeRow}>
          {/* AWaRe */}
          <View style={[styles.awareBadge, { backgroundColor: awareColor + '18' }]}>
            <View style={[styles.awareDot, { backgroundColor: awareColor }]} />
            <Text style={[styles.awareBadgeText, { color: awareColor }]}>{aware}</Text>
          </View>
          {/* Status */}
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ── Main Screen ──────────────────────────────────── */

export default function VetHomeScreen() {
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
            <Text style={styles.headerIcon}>🩺</Text>
            <Text style={styles.headerTitle}>Vétérinaire</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>V</Text>
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

        {/* AI Assistant */}
        <AIAssistantCard />

        {/* New Prescription CTA */}
        <TouchableOpacity style={styles.heroCta} activeOpacity={0.85} onPress={() => router.push('/(vet)/new-prescription')}>
          <View style={styles.heroCtaContent}>
            <View style={styles.heroCtaIcon}>
              <Text style={styles.heroCtaPlusIcon}>+</Text>
            </View>
            <View>
              <Text style={styles.heroCtaTitle}>Nouvelle Prescription</Text>
              <Text style={styles.heroCtaSubtitle}>Prescrire un traitement</Text>
            </View>
          </View>
          <Text style={styles.heroCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Prescriptions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prescriptions Actives</Text>
          <TouchableOpacity onPress={() => router.push('/(vet)/prescriptions')}>
            <Text style={styles.seeAllLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {prescriptions.map((p, i) => (
          <PrescriptionCard key={i} {...p} />
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(vet)/prescriptions')}>
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Rx</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(vet)/ai-assistant')}>
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={styles.tabLabel}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(vet)/profile')}>
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
  headerIcon: { fontSize: 24 },
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

  // AI Assistant Card
  aiCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  aiIcon: { fontSize: 22 },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  aiInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.onSurface,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  aiBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  aiBadgeText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
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

  // Prescription Cards
  prescriptionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  prescriptionAnimal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  prescriptionFarm: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  countdownBadge: {
    backgroundColor: Colors.status.withdrawal + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.status.withdrawal,
  },
  prescriptionFooter: {
    gap: Spacing.sm,
  },
  prescriptionDrug: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  statusBadgeText: {
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
