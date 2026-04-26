/**
 * Pharmacy — Alerts Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const alerts = [
  { type: 'reserve', title: 'Vente Colistine détectée', desc: 'Vente V-2039 · Antibiotique Reserve (OMS)', time: 'Il y a 2h', icon: '🔴' },
  { type: 'expiry', title: 'Stock proche expiration', desc: 'Amoxicilline 500mg · Lot B-2024-03 expire dans 15 jours', time: 'Il y a 5h', icon: '⏰' },
  { type: 'anomaly', title: 'Anomalie IA détectée', desc: 'Volume inhabituel de ventes Watch ce mois (+35%)', time: 'Hier', icon: '🤖' },
  { type: 'info', title: 'Nouveau vétérinaire enregistré', desc: 'Dr. Khaled rejoint le réseau SAFAR', time: '2 jours', icon: '📋' },
];

export default function AlertsScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Alertes</Text>
        <Text style={s.subtitle}>{alerts.length} notifications</Text>

        {alerts.map((a, i) => (
          <View key={i} style={[s.card, a.type === 'reserve' && s.cardUrgent]}>
            <Text style={s.alertIcon}>{a.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{a.title}</Text>
              <Text style={s.alertDesc}>{a.desc}</Text>
              <Text style={s.alertTime}>{a.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/sales')}><Text style={s.tabIcon}>📋</Text><Text style={s.tabLabel}>Ventes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>🔔</Text><Text style={s.tabLabelActive}>Alertes</Text></TouchableOpacity>
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
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', ...Shadows.sm },
  cardUrgent: { borderLeftWidth: 3, borderLeftColor: Colors.aware.reserve },
  alertIcon: { fontSize: 24, marginTop: 2 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  alertDesc: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, lineHeight: 18 },
  alertTime: { fontSize: 11, color: Colors.outline, marginTop: 4 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
