/**
 * SAFAR Chain — Pharmacy Home Screen
 * Stats row, "Nouvelle Vente" hero CTA, recent sales list.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getRecentDrugSales } from '@/services/api';
import type { DrugSaleResponse } from '@/services/types';
import { useAuth } from '@/store/authStore';
import { FileText, Home, ShoppingCart, Bell, User, Pill, Plus, ArrowRight } from 'lucide-react-native';

const awareColors: Record<string, string> = {
  Access: Colors.aware.access,
  Watch: Colors.aware.watch,
  Reserve: Colors.aware.reserve,
};

function AWaReBadge({ classification }: { classification: string }) {
  const color = awareColors[classification] || Colors.outline;
  return (
    <View style={[styles.awareBadge, { backgroundColor: color + '1A' }]}>
      <View style={[styles.awareDot, { backgroundColor: color }]} />
      <Text style={[styles.awareBadgeText, { color }]}>{classification}</Text>
    </View>
  );
}

export default function PharmacyHomeScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<DrugSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentDrugSales()
      .then(setSales)
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { value: String(sales.length), label: 'Ventes', color: Colors.primary },
    { value: String(new Set(sales.map((s) => s.vet_id)).size), label: 'Vétérinaires', color: Colors.secondary },
    { value: String(sales.reduce((a, s) => a + s.quantity, 0)), label: 'Doses', color: Colors.onSurfaceVariant },
  ];

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
            <View style={styles.roleChip}>
              <Pill size={16} color={Colors.primary} />
              <Text style={styles.roleChipText}>Pharmacie</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Bell size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'P'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>Bonjour, {user?.name || 'Pharmacien'}</Text>

        <View style={styles.sectionGap}>
          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
               <View key={i} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* New Sale CTA */}
          <TouchableOpacity style={styles.heroCta} activeOpacity={0.85} onPress={() => router.push('/(pharmacy)/new-sale')}>
            <View style={styles.heroCtaContent}>
              <View style={styles.heroCtaIcon}>
                <Plus size={24} color={Colors.onPrimary} />
              </View>
              <View>
                <Text style={styles.heroCtaTitle}>Nouvelle Vente</Text>
                <Text style={styles.heroCtaSubtitle}>Enregistrer une dispensation</Text>
              </View>
            </View>
            <ArrowRight size={24} color={Colors.onPrimary} />
          </TouchableOpacity>

          {/* Recent Sales */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ventes Récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(pharmacy)/sales')} activeOpacity={0.7}>
              <Text style={styles.seeAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : sales.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>Aucune vente récente</Text>
            </View>
          ) : (
            sales.slice(0, 5).map((sale, i) => (
               <TouchableOpacity key={sale.sale_id || i} style={styles.saleCard} activeOpacity={0.8}>
                <View style={styles.saleHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.saleDrug}>{sale.atc_code}</Text>
                    <Text style={styles.saleAtc}>Lot: {sale.batch_number} · x{sale.quantity}</Text>
                  </View>
                  <AWaReBadge classification={sale.aware_class} />
                </View>
                <View style={styles.saleFooter}>
                  <Text style={styles.saleDetail}>Vet: {sale.vet_id?.slice(0, 8)}…</Text>
                  <Text style={styles.saleDetail}>{new Date(sale.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <Text style={styles.txHash}>{sale.tx_hash?.slice(0, 10)}…{sale.tx_hash?.slice(-6)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <Home size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(pharmacy)/sales')}>
          <ShoppingCart size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(pharmacy)/alerts')}>
          <Bell size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Alertes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(pharmacy)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Profil</Text>
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

  heroCta: { 
    backgroundColor: Colors.primary, 
    borderRadius: Radii.xl, 
    padding: Spacing.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    ...Shadows.md
  },
  heroCtaContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroCtaIcon: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  heroCtaTitle: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
  heroCtaSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  seeAllLink: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  emptyText: { color: Colors.onSurfaceVariant, fontSize: 14 },

  saleCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.md, 
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm 
  },
  saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  saleDrug: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  saleAtc: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  saleFooter: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xs },
  saleDetail: { fontSize: 12, color: Colors.onSurfaceVariant },
  txHash: { fontSize: 11, fontFamily: Fonts?.mono, color: Colors.outlineVariant, marginTop: Spacing.xs },
  
  awareBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full, gap: 4 },
  awareDot: { width: 6, height: 6, borderRadius: 3 },
  awareBadgeText: { fontSize: 11, fontWeight: '700' },

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
