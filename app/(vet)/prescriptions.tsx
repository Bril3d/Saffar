/**
 * Vet — Prescriptions List Screen
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { apiClient } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { PrescriptionResponse } from '@/services/types';

const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: Colors.primary, bg: Colors.primaryFixed },
  withdrawal: { label: 'Retrait', color: Colors.status.withdrawal, bg: '#FFF8E1' },
  completed: { label: 'Terminée', color: Colors.status.certified, bg: '#E8F5E9' },
};

function deriveStatus(rx: PrescriptionResponse): 'active' | 'withdrawal' | 'completed' {
  if (!rx.administered) return 'active';
  const wEnd = new Date(rx.withdrawal_end);
  return wEnd.getTime() > Date.now() ? 'withdrawal' : 'completed';
}

export default function PrescriptionsScreen() {
  const { user } = useAuth();
  const [prescriptions, setRxs] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/prescriptions')
      .then(res => setRxs(res.data?.data?.prescriptions || []))
      .catch(() => setRxs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Mes Prescriptions</Text>
        <Text style={s.subtitle}>{prescriptions.length} prescriptions</Text>
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} /> :
          prescriptions.length === 0 ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 30 }}>Aucune prescription</Text> :
          prescriptions.map((rx) => {
            const status = deriveStatus(rx);
            const cfg = statusCfg[status];
            return (
              <TouchableOpacity key={rx.rx_id} style={s.card} onPress={() => router.push({ pathname: '/(vet)/prescription-detail', params: { rxId: rx.rx_id } } as any)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rxId}>{rx.rx_id?.slice(0, 12)}</Text>
                  <Text style={s.rxDrug}>{rx.diagnosis}</Text>
                  <Text style={s.rxFarmer}>Lot: {rx.animal_lot_id} · {new Date(rx.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        }
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
