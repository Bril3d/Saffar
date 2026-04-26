/**
 * Farmer — Lots List Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const lots = [
  { id: '#1234', name: 'Poulets de chair', status: 'certified' as const, count: 120, daysLeft: 0 },
  { id: '#1235', name: 'Oeufs', status: 'withdrawal' as const, count: 500, daysLeft: 3 },
  { id: '#1236', name: 'Bovins', status: 'pending' as const, count: 15, daysLeft: 0 },
  { id: '#1237', name: 'Oeufs bio', status: 'certified' as const, count: 300, daysLeft: 0 },
  { id: '#1238', name: 'Ovins', status: 'withdrawal' as const, count: 25, daysLeft: 8 },
];
const statusCfg = {
  certified: { label: 'Certifié ✅', color: Colors.status.certified, bg: '#E8F5E9' },
  withdrawal: { label: 'En retrait ⏳', color: Colors.status.withdrawal, bg: '#FFF8E1' },
  pending: { label: 'En attente', color: Colors.status.pending, bg: '#F5F5F5' },
};

export default function LotsScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Mes Lots</Text>
        <Text style={s.subtitle}>{lots.length} lots actifs</Text>
        {lots.map((lot, i) => {
          const cfg = statusCfg[lot.status];
          return (
            <View key={i} style={[s.card, { borderLeftColor: cfg.color }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.lotId}>Lot {lot.id}</Text>
                <Text style={s.lotName}>{lot.name}</Text>
                <Text style={s.lotCount}>{lot.count} unités</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={[s.badge, { backgroundColor: cfg.bg }]}><Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text></View>
                {lot.daysLeft > 0 && <Text style={s.daysLeft}>J-{lot.daysLeft}</Text>}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>🐔</Text><Text style={s.tabLabelActive}>Mes Lots</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/farmer-sales')}><Text style={s.tabIcon}>🛒</Text><Text style={s.tabLabel}>Ventes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/profile')}><Text style={s.tabIcon}>👤</Text><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, ...Shadows.sm },
  lotId: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant },
  lotName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginTop: 2 },
  lotCount: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  badgeText: { fontSize: 11, fontWeight: '700' },
  daysLeft: { fontSize: 13, fontWeight: '800', color: Colors.status.withdrawal },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
