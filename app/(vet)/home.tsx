/**
 * SAFAR Chain — Vet Home (dynamic from API)
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getRecentDrugSales, getAllLots } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { DrugSaleResponse } from '@/services/types';
import { ClipboardList, Bot, User, Stethoscope, Home, Bell, Plus, ArrowRight, Package } from 'lucide-react-native';

const aw: Record<string, string> = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function VetHomeScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<DrugSaleResponse[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRecentDrugSales().then(setSales).catch(() => setSales([])),
      getAllLots().then(r => setLots(r.lots || [])).catch(() => setLots([])),
    ]).finally(() => setLoading(false));
  }, []);

  const pendingLots = lots.filter(l => l.prescription_count === 0);

  const stats = [
    { value: String(sales.length), label: 'Ventes', color: Colors.primary },
    { value: String(pendingLots.length), label: 'Lots à traiter', color: Colors.warning },
    { value: String(sales.reduce((a, s) => a + s.quantity, 0)), label: 'Doses', color: Colors.onSurfaceVariant },
  ];

  return (
    <SafeAreaView style={st.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={st.header}>
          <View style={st.headerLeft}>
            <View style={st.roleChip}>
              <Stethoscope size={16} color={Colors.primary} />
              <Text style={st.roleChipText}>Vétérinaire</Text>
            </View>
          </View>
          <View style={st.headerRight}>
            <TouchableOpacity style={st.notifBtn} activeOpacity={0.7}>
              <Bell size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={st.avatar}>
              <Text style={st.avatarText}>{user?.name?.[0]?.toUpperCase() || 'V'}</Text>
            </View>
          </View>
        </View>

        <Text style={st.pageTitle}>Bonjour, {user?.name || 'Docteur'}</Text>

        <View style={st.sectionGap}>
          
          <View style={st.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={st.statCard}>
                <Text style={[st.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={st.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* AI Assistant Card */}
          <View style={st.aiCard}>
            <View style={st.aiHeader}>
              <Bot size={22} color={Colors.primary} />
              <Text style={st.aiTitle}>Assistant IA Vétérinaire</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(vet)/ai-assistant')}>
              <View style={st.aiInput}>
                <Text style={{ color: Colors.onSurfaceDisabled }}>Décrivez les symptômes...</Text>
              </View>
            </TouchableOpacity>
            <View style={st.aiBadge}>
              <View style={st.aiBadgeDot} />
              <Text style={st.aiBadgeText}>100% local · Ollama phi3:mini</Text>
            </View>
          </View>

          {/* New Prescription CTA */}
          <TouchableOpacity style={st.heroCta} activeOpacity={0.85} onPress={() => router.push('/(vet)/new-prescription')}>
            <View style={st.heroCtaContent}>
              <View style={st.heroCtaIcon}>
                <Plus size={24} color={Colors.onPrimary} />
              </View>
              <View>
                <Text style={st.heroCtaTitle}>Nouvelle Prescription</Text>
                <Text style={st.heroCtaSubtitle}>Prescrire un traitement</Text>
              </View>
            </View>
            <ArrowRight size={24} color={Colors.onPrimary} />
          </TouchableOpacity>

          {/* Pending Lots from Farmers */}
          {pendingLots.length > 0 && (<>
            <View style={st.sectionHeader}>
              <Text style={st.sectionTitle}>Lots en Attente</Text>
              <Text style={{ fontSize: 13, color: Colors.warning, fontWeight: '700' }}>{pendingLots.length} à traiter</Text>
            </View>
            {pendingLots.slice(0, 5).map((lot: any, i: number) => (
              <TouchableOpacity 
                key={lot.id || i} 
                style={st.lotCard} 
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(vet)/new-prescription', params: { prefillFarmerId: lot.farmer_id, prefillLotId: lot.id } } as any)}
              >
                <View style={st.lotIcon}>
                  <Package size={20} color={Colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.lotName}>{lot.name} ({lot.species || 'Bovin'})</Text>
                  <Text style={st.lotFarmer}>Éleveur: {lot.farmer_name} · {lot.quantity || 1} tête(s)</Text>
                  <Text style={st.lotDate}>{new Date(lot.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={st.lotBadge}>
                  <Text style={st.lotBadgeText}>Prescrire</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>)}

          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>Ventes Récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(vet)/prescriptions')} activeOpacity={0.7}>
              <Text style={st.seeAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} /> :
            sales.length === 0 ? (
              <View style={st.emptyState}>
                 <ClipboardList size={48} color={Colors.outlineVariant} />
                 <Text style={st.emptyStateText}>Aucune donnée récente</Text>
              </View>
            ) :
            sales.slice(0, 4).map((sale, i) => (
              <TouchableOpacity key={sale.sale_id || i} style={st.rxCard} activeOpacity={0.8}>
                <View style={{ flex: 1 }}>
                  <Text style={st.rxAnimal}>{sale.atc_code}</Text>
                  <Text style={st.rxFarm}>Lot: {sale.batch_number}</Text>
                </View>
                <View style={[st.awareBadge, { backgroundColor: (aw[sale.aware_class] || Colors.outline) + '1A' }]}>
                  <Text style={[st.awareBadgeText, { color: aw[sale.aware_class] || Colors.onSurfaceVariant }]}>{sale.aware_class}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={st.tabBar}>
        <TouchableOpacity style={st.tab} activeOpacity={0.7}>
          <Home size={24} color={Colors.primary} />
          <Text style={st.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/prescriptions')}>
          <ClipboardList size={24} color={Colors.onSurfaceDisabled} />
          <Text style={st.tabLabel}>Rx</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/ai-assistant')}>
          <Bot size={24} color={Colors.onSurfaceDisabled} />
          <Text style={st.tabLabel}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={st.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
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

  aiCard: { 
    backgroundColor: Colors.surfaceContainerLow, 
    borderRadius: Radii.xl, 
    padding: Spacing.lg, 
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  aiTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  aiInput: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    padding: Spacing.md, 
    minHeight: 50, 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  aiBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  aiBadgeText: { fontSize: 11, color: Colors.onSurfaceVariant, fontWeight: '500' },

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
  emptyStateText: { color: Colors.onSurfaceVariant, fontSize: 14 },

  rxCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm 
  },
  rxAnimal: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  rxFarm: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  awareBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full },
  awareBadgeText: { fontSize: 12, fontWeight: '700' },

  lotCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm 
  },
  lotIcon: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#FFF8E1', 
    alignItems: 'center', justifyContent: 'center' 
  },
  lotName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  lotFarmer: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  lotDate: { fontSize: 11, color: Colors.outline, marginTop: 2 },
  lotBadge: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: Radii.full 
  },
  lotBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.onPrimary },

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
