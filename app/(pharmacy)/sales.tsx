/**
 * Pharmacy — Sales History Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const awareColors = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

const sales = [
  { id: 'V-2041', drug: 'Amoxicilline 500mg', vet: 'Dr. Ben Ali', date: '26 Avr', qty: 3, aware: 'Access' as const },
  { id: 'V-2040', drug: 'Enrofloxacine 100mg', vet: 'Dr. Trabelsi', date: '25 Avr', qty: 1, aware: 'Watch' as const },
  { id: 'V-2039', drug: 'Colistine 2MUI', vet: 'Dr. Mansouri', date: '24 Avr', qty: 2, aware: 'Reserve' as const },
  { id: 'V-2038', drug: 'Amoxicilline 500mg', vet: 'Dr. Hamdi', date: '23 Avr', qty: 5, aware: 'Access' as const },
  { id: 'V-2037', drug: 'Enrofloxacine 100mg', vet: 'Dr. Ben Ali', date: '22 Avr', qty: 1, aware: 'Watch' as const },
];

export default function SalesScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Historique des Ventes</Text>
        <Text style={s.subtitle}>{sales.length} ventes ce mois</Text>

        {sales.map((sale, i) => (
          <View key={i} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.saleId}>{sale.id}</Text>
              <Text style={s.saleDrug}>{sale.drug}</Text>
              <Text style={s.saleMeta}>{sale.vet} · x{sale.qty}</Text>
            </View>
            <View style={s.cardRight}>
              <View style={[s.awareBadge, { backgroundColor: awareColors[sale.aware] + '18' }]}>
                <Text style={[s.awareText, { color: awareColors[sale.aware] }]}>{sale.aware}</Text>
              </View>
              <Text style={s.saleDate}>{sale.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>📋</Text><Text style={s.tabLabelActive}>Ventes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/alerts')}><Text style={s.tabIcon}>🔔</Text><Text style={s.tabLabel}>Alertes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/profile')}><Text style={s.tabIcon}>👤</Text><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...Shadows.sm },
  cardLeft: { flex: 1 },
  saleId: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant },
  saleDrug: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginTop: 2 },
  saleMeta: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  awareBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.full },
  awareText: { fontSize: 11, fontWeight: '700' },
  saleDate: { fontSize: 11, color: Colors.outline },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
