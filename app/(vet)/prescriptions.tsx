/**
 * Vet — Prescriptions List Screen
 * Premium list with status indicators and consistent design system.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getVetPrescriptions } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { PrescriptionResponse } from '@/services/types';
import { Home, ClipboardList, Bot, User, Syringe, Clock, CheckCircle2 } from 'lucide-react-native';

const statusCfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: Colors.primary, bg: Colors.primary + '1A', icon: <Syringe size={16} color={Colors.primary} /> },
  withdrawal: { label: 'Retrait', color: Colors.warning, bg: '#FFF8E1', icon: <Clock size={16} color={Colors.warning} /> },
  completed: { label: 'Terminée', color: Colors.success, bg: Colors.success + '1A', icon: <CheckCircle2 size={16} color={Colors.success} /> },
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
    getVetPrescriptions()
      .then(setRxs)
      .catch(() => setRxs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Mes Prescriptions</Text>
            <Text style={styles.subtitle}>{prescriptions.length} prescriptions enregistrées</Text>
          </View>
        </View>
        
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} /> :
          prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <ClipboardList size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>Aucune prescription</Text>
            </View>
          ) :
          prescriptions.map((rx) => {
            const status = deriveStatus(rx);
            const cfg = statusCfg[status];
            return (
              <TouchableOpacity 
                key={rx.rx_id} 
                style={styles.card} 
                onPress={() => router.push({ pathname: '/(vet)/prescription-detail', params: { rxId: rx.rx_id } } as any)} 
                activeOpacity={0.7}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.rxId}>Rx {rx.rx_id?.slice(0, 8)}</Text>
                  <Text style={styles.rxDrug}>{rx.diagnosis || 'Traitement'}</Text>
                  <Text style={styles.rxFarmer}>Lot: {rx.animal_lot_id} · {new Date(rx.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  {cfg.icon}
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        }
      </ScrollView>
      
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/home')}>
          <Home size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <ClipboardList size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>Rx</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/ai-assistant')}>
          <Bot size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.md },
  emptyText: { color: Colors.onSurfaceVariant, fontSize: 15 },
  
  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.lg, 
    marginBottom: Spacing.md, 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  cardLeft: { flex: 1 },
  rxId: { fontSize: 13, fontFamily: Fonts?.mono, fontWeight: '700', color: Colors.onSurfaceVariant },
  rxDrug: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginTop: 4 },
  rxFarmer: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: Radii.full 
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  
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
