/**
 * Abattoir — Scan History Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const scans = [
  { lot: '#1234', farm: 'Ferme El Baraka', result: 'eligible' as const, date: '26 Avr', time: '09:15' },
  { lot: '#1235', farm: 'Ferme Sidi Bou', result: 'rejected' as const, date: '26 Avr', time: '09:45' },
  { lot: '#1236', farm: 'Ferme Al Waha', result: 'eligible' as const, date: '26 Avr', time: '10:30' },
  { lot: '#1230', farm: 'Ferme Ennour', result: 'eligible' as const, date: '25 Avr', time: '08:22' },
  { lot: '#1229', farm: 'Ferme Sidi Bou', result: 'rejected' as const, date: '25 Avr', time: '11:10' },
  { lot: '#1228', farm: 'Ferme El Baraka', result: 'eligible' as const, date: '24 Avr', time: '09:00' },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Historique des Scans</Text>
        <Text style={s.subtitle}>{scans.length} scans récents</Text>
        {scans.map((scan, i) => (
          <View key={i} style={s.card}>
            <View style={[s.dot, { backgroundColor: scan.result === 'eligible' ? Colors.status.certified : Colors.status.rejected }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.lot}>Lot {scan.lot}</Text>
              <Text style={s.farm}>{scan.farm}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={[s.resultBadge, { backgroundColor: scan.result === 'eligible' ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text style={[s.resultText, { color: scan.result === 'eligible' ? Colors.status.certified : Colors.status.rejected }]}>
                  {scan.result === 'eligible' ? '✅ Éligible' : '❌ Rejeté'}
                </Text>
              </View>
              <Text style={s.time}>{scan.date} · {scan.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/scanner')}><Text style={s.tabIcon}>📷</Text><Text style={s.tabLabel}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>📋</Text><Text style={s.tabLabelActive}>Historique</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/profile')}><Text style={s.tabIcon}>👤</Text><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, ...Shadows.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lot: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  farm: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  resultText: { fontSize: 11, fontWeight: '700' },
  time: { fontSize: 10, color: Colors.outline, marginTop: 4 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
