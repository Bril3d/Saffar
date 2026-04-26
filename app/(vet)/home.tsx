/**
 * SAFAR Chain — Vet Home (dynamic from API)
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getRecentDrugSales } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { DrugSaleResponse } from '@/services/types';

const aw: Record<string, string> = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function VetHomeScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<DrugSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentDrugSales().then(setSales).catch(() => setSales([])).finally(() => setLoading(false));
  }, []);

  const stats = [
    { value: String(sales.length), label: 'Ventes liées', color: Colors.primary },
    { value: String(new Set(sales.map(s => s.batch_number)).size), label: 'Lots actifs', color: Colors.secondary },
    { value: String(sales.reduce((a, s) => a + s.quantity, 0)), label: 'Doses restantes', color: Colors.onSurfaceVariant },
  ];

  return (
    <SafeAreaView style={st.container}><StatusBar style="dark" />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={st.header}>
          <View style={st.headerLeft}><Text style={{ fontSize: 24 }}>🩺</Text><Text style={st.headerTitle}>Vétérinaire</Text></View>
          <View style={st.headerRight}>
            <TouchableOpacity style={st.notifBtn}><Text style={{ fontSize: 18 }}>🔔</Text></TouchableOpacity>
            <View style={st.avatar}><Text style={st.avatarText}>{user?.name?.[0] || 'V'}</Text></View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.statsRow}>
          {stats.map((s, i) => <View key={i} style={st.statCard}><Text style={[st.statValue, { color: s.color }]}>{s.value}</Text><Text style={st.statLabel}>{s.label}</Text></View>)}
        </ScrollView>

        {/* AI Assistant Card */}
        <View style={st.aiCard}>
          <View style={st.aiHeader}><Text style={{ fontSize: 22 }}>🤖</Text><Text style={st.aiTitle}>Assistant IA Vétérinaire</Text></View>
          <TouchableOpacity onPress={() => router.push('/(vet)/ai-assistant')}>
            <View style={st.aiInput}><Text style={{ color: Colors.outline }}>Décrivez les symptômes...</Text></View>
          </TouchableOpacity>
          <View style={st.aiBadge}><View style={st.aiBadgeDot} /><Text style={st.aiBadgeText}>100% local · Ollama phi3:mini</Text></View>
        </View>

        {/* New Prescription CTA */}
        <TouchableOpacity style={st.heroCta} activeOpacity={0.85} onPress={() => router.push('/(vet)/new-prescription')}>
          <View style={st.heroCtaContent}><View style={st.heroCtaIcon}><Text style={st.heroCtaPlusIcon}>+</Text></View><View><Text style={st.heroCtaTitle}>Nouvelle Prescription</Text><Text style={st.heroCtaSubtitle}>Prescrire un traitement</Text></View></View>
          <Text style={st.heroCtaArrow}>→</Text>
        </TouchableOpacity>

        <View style={st.sectionHeader}><Text style={st.sectionTitle}>Ventes Récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(vet)/prescriptions')}><Text style={st.seeAllLink}>Voir tout</Text></TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} /> :
          sales.length === 0 ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 20 }}>Aucune donnée</Text> :
          sales.slice(0, 4).map((sale, i) => (
            <View key={sale.sale_id || i} style={st.rxCard}>
              <View style={{ flex: 1 }}><Text style={st.rxAnimal}>{sale.atc_code}</Text><Text style={st.rxFarm}>Lot: {sale.batch_number}</Text></View>
              <View style={[st.awareBadge, { backgroundColor: (aw[sale.aware_class] || Colors.outline) + '18' }]}>
                <Text style={[st.awareBadgeText, { color: aw[sale.aware_class] || Colors.outline }]}>{sale.aware_class}</Text>
              </View>
            </View>
          ))
        }
      </ScrollView>

      <View style={st.tabBar}>
        <TouchableOpacity style={st.tab}><Text style={{ fontSize: 22 }}>🏠</Text><Text style={st.tabLabelActive}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(vet)/prescriptions')}><Text style={st.tabIcon}>📋</Text><Text style={st.tabLabel}>Rx</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(vet)/ai-assistant')}><Text style={st.tabIcon}>🤖</Text><Text style={st.tabLabel}>IA</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(vet)/profile')}><Text style={st.tabIcon}>👤</Text><Text style={st.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
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
  statCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, minWidth: 120, ...Shadows.sm },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2, fontWeight: '500' },
  aiCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  aiTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  aiInput: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, minHeight: 50, justifyContent: 'center' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  aiBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  aiBadgeText: { fontSize: 11, color: Colors.onSurfaceVariant, fontWeight: '500' },
  heroCta: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.xl, padding: Spacing.lg, marginVertical: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Shadows.glow(Colors.primaryContainer) },
  heroCtaContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroCtaIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  heroCtaPlusIcon: { fontSize: 24, fontWeight: '300', color: Colors.onPrimary },
  heroCtaTitle: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
  heroCtaSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  heroCtaArrow: { fontSize: 22, color: Colors.onPrimary, fontWeight: '300' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  seeAllLink: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  rxCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', ...Shadows.sm },
  rxAnimal: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  rxFarm: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  awareBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  awareBadgeText: { fontSize: 11, fontWeight: '700' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
