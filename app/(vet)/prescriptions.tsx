/**
 * Vet — Prescriptions List Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const prescriptions = [
  { id: 'P-1234', drug: 'Amoxicilline 500mg', farmer: 'Ferme El Baraka', status: 'active' as const, date: '22 Avr' },
  { id: 'P-1233', drug: 'Enrofloxacine 100mg', farmer: 'Ferme Sidi Bou', status: 'withdrawal' as const, date: '20 Avr' },
  { id: 'P-1232', drug: 'Amoxicilline 500mg', farmer: 'Ferme Al Waha', status: 'completed' as const, date: '15 Avr' },
  { id: 'P-1231', drug: 'Colistine 2MUI', farmer: 'Ferme Ennour', status: 'completed' as const, date: '10 Avr' },
];
const statusCfg = {
  active: { label: 'Active', color: Colors.primary, bg: Colors.primaryFixed },
  withdrawal: { label: 'Retrait', color: Colors.status.withdrawal, bg: '#FFF8E1' },
  completed: { label: 'Terminée', color: Colors.status.certified, bg: '#E8F5E9' },
};

export default function PrescriptionsScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Mes Prescriptions</Text>
        <Text style={s.subtitle}>{prescriptions.length} prescriptions</Text>
        {prescriptions.map((rx, i) => {
          const cfg = statusCfg[rx.status];
          return (
            <TouchableOpacity key={i} style={s.card} onPress={() => router.push('/(vet)/prescription-detail')} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <Text style={s.rxId}>{rx.id}</Text>
                <Text style={s.rxDrug}>{rx.drug}</Text>
                <Text style={s.rxFarmer}>{rx.farmer} · {rx.date}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>📋</Text><Text style={s.tabLabelActive}>Rx</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/ai-assistant')}><Text style={s.tabIcon}>🤖</Text><Text style={s.tabLabel}>IA</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/profile')}><Text style={s.tabIcon}>👤</Text><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', ...Shadows.sm },
  rxId: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant },
  rxDrug: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginTop: 2 },
  rxFarmer: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
