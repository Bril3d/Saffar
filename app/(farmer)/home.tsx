/**
 * SAFAR Chain — Farmer (Éleveur) Home Screen
 * Withdrawal alerts, lot cards with status, offline indicator.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getFarmerPrescriptions } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { PrescriptionResponse } from '@/services/types';
import { Tractor, Home, Package, ShoppingCart, User, Bell, Plus, AlertTriangle, Bot } from 'lucide-react-native';

const statusCfg = {
  certified: { label: 'Éligible', color: Colors.success, bg: '#E8F5E9' },
  withdrawal: { label: 'En retrait', color: Colors.warning, bg: '#FFF8E1' },
  pending: { label: 'En attente', color: Colors.status.pending, bg: '#F0EDE6' },
};

export default function FarmerHomeScreen() {
  const { user } = useAuth();
  const [prescriptions, setRxs] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getFarmerPrescriptions(user.id).then(setRxs).catch(() => setRxs([])).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [user?.id]);

  const lots = prescriptions.map(rx => {
    const wEnd = new Date(rx.withdrawal_end);
    const days = Math.max(0, Math.ceil((wEnd.getTime() - Date.now()) / 86400000));
    const status = rx.administered ? (days > 0 ? 'withdrawal' : 'certified') : 'pending';
    return { id: rx.rx_id?.slice(0, 8), name: rx.diagnosis || rx.animal_lot_id, status: status as 'certified'|'withdrawal'|'pending', daysRemaining: days };
  });

  const stats = [
    { value: String(lots.length), label: 'Lots actifs', color: Colors.onSurfaceVariant },
    { value: String(lots.filter(l => l.status === 'certified').length), label: 'Éligibles', color: Colors.success },
    { value: String(lots.filter(l => l.status === 'withdrawal').length), label: 'En retrait', color: Colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.roleChip}>
              <Tractor size={16} color={Colors.primary} />
              <Text style={styles.roleChipText}>Éleveur</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Bell size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'E'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>Bonjour, {user?.name || 'Éleveur'}</Text>

        <View style={styles.sectionGap}>
          {/* Alerts */}
          {lots.filter(l => l.status === 'withdrawal').length > 0 && (
            <View style={styles.alertBanner}>
              <AlertTriangle size={24} color="#F57F17" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{lots.filter(l => l.status === 'withdrawal').length} lots en période de retrait</Text>
                <Text style={styles.alertSubtitle}>Vérifiez les délais avant publication</Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
               <View key={i} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* AI Assistant Card */}
          <TouchableOpacity style={styles.aiCard} activeOpacity={0.85} onPress={() => router.push('/(farmer)/ai-assistant')}>
            <View style={styles.aiHeader}>
              <Bot size={22} color={Colors.primary} />
              <Text style={styles.aiTitle}>Assistant IA Éleveur</Text>
            </View>
            <Text style={styles.aiDesc}>Posez vos questions sur les lots, délais de retrait, bonnes pratiques...</Text>
          </TouchableOpacity>

          {/* Lots Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes Lots Récents</Text>
          </View>

          {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} /> :
            lots.length === 0 ? (
              <View style={styles.emptyState}>
                 <Package size={48} color={Colors.outlineVariant} />
                 <Text style={{ color: Colors.onSurfaceVariant, marginTop: Spacing.md }}>Aucun lot actif</Text>
              </View>
            ) : (
            <View style={styles.lotGrid}>
              {lots.slice(0, 4).map((lot, i) => {
                const cfg = statusCfg[lot.status];
                return (
                  <TouchableOpacity key={lot.id || i} style={styles.card} activeOpacity={0.7}>
                    <View style={styles.cardPhoto}>
                      <Image source={require('@/assets/images/cattle.png')} style={{ width: '100%', height: '100%', borderRadius: Radii.sm }} resizeMode="cover" />
                    </View>
                    <Text style={styles.lotId}>#{lot.id}</Text>
                    <Text style={styles.lotBreed}>{lot.name || 'Bovin'}</Text>
                    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.chipText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    {lot.daysRemaining > 0 && <Text style={styles.daysLeft}>J-{lot.daysRemaining}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => router.push('/(farmer)/add-lot')}>
        <Plus size={24} color={Colors.onPrimary} />
      </TouchableOpacity>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <Home size={24} color={Colors.primary} /><Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/lots')}>
          <Package size={24} color={Colors.onSurfaceDisabled} /><Text style={styles.tabLabel}>Mes Lots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/farmer-sales')}>
          <ShoppingCart size={24} color={Colors.onSurfaceDisabled} /><Text style={styles.tabLabel}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/ai-assistant')}>
          <Bot size={24} color={Colors.onSurfaceDisabled} /><Text style={styles.tabLabel}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} /><Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 120 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  roleChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary + '1A', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 6, 
    borderRadius: Radii.full,
    gap: Spacing.xs,
  },
  roleChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: { 
    width: 40, height: 40, borderRadius: Radii.full, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  avatar: { 
    width: 40, height: 40, borderRadius: Radii.full, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center' 
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimary },

  pageTitle: { fontSize: 28, fontWeight: '700', color: Colors.onSurface, letterSpacing: -0.5, marginBottom: Spacing.xl },

  sectionGap: { gap: Spacing.lg },

  // Alert
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFECB3',
    ...Shadows.sm,
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#F57F17' },
  alertSubtitle: { fontSize: 12, color: '#F9A825', marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  statCard: { 
    flex: 1, 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.md, 
    borderWidth: 1, 
    borderColor: Colors.outline,
    ...Shadows.sm 
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' },

  aiCard: { 
    backgroundColor: Colors.surfaceContainerLow, 
    borderRadius: Radii.xl, 
    padding: Spacing.lg, 
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  aiTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  aiDesc: { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 18 },

  sectionHeader: { marginTop: Spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },

  // Lot grid
  lotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.sm, 
    marginBottom: Spacing.md, 
    borderWidth: 1, 
    borderColor: Colors.outline,
    ...Shadows.sm
  },
  cardPhoto: {
    height: 80,
    borderRadius: Radii.sm,
    backgroundColor: '#E6E2DA',
    marginBottom: Spacing.sm,
  },
  lotId: { fontFamily: Fonts?.mono, fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 2 },
  lotBreed: { fontSize: 13, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.sm },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full, marginTop: 4 },
  chipText: { fontSize: 11, fontWeight: '600' },
  daysLeft: { fontSize: 13, fontWeight: '800', color: Colors.warning, marginTop: Spacing.xs },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },

  // Tab Bar
  tabBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    flexDirection: 'row', 
    backgroundColor: 'rgba(247, 245, 240, 0.9)', 
    borderTopWidth: 1, borderTopColor: Colors.outline,
    paddingTop: 8, paddingBottom: 24, 
    justifyContent: 'center',
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, maxWidth: 100 }, 
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceDisabled }, 
  tabLabelActive: { fontSize: 10, fontWeight: '600', color: Colors.primary },
});
