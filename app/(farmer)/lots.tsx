/**
 * Farmer — Lots List Screen (dynamic from API)
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getFarmerPrescriptions, getFarmerLots } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { PrescriptionResponse } from '@/services/types';
import { Home, Package, ShoppingCart, User, Plus, Bot } from 'lucide-react-native';

const statusCfg = {
  certified: { label: 'Éligible', color: Colors.success, bg: '#E8F5E9' },
  withdrawal: { label: 'En retrait', color: Colors.warning, bg: '#FFF8E1' },
  pending: { label: 'En attente', color: Colors.status.pending, bg: '#F0EDE6' },
};

function deriveLots(prescriptions: PrescriptionResponse[], dbLots: any[]) {
  // Group by animal_lot_id
  const grouped: Record<string, PrescriptionResponse[]> = {};
  for (const rx of prescriptions) {
    if (!grouped[rx.animal_lot_id]) grouped[rx.animal_lot_id] = [];
    grouped[rx.animal_lot_id].push(rx);
  }
  
  // Merge with dbLots
  const result = [];
  const handledLotIds = new Set<string>();

  // Process lots that have prescriptions
  for (const [lotId, rxs] of Object.entries(grouped)) {
    const latestRx = rxs[rxs.length - 1];
    const wEnd = new Date(latestRx.withdrawal_end);
    const daysLeft = Math.max(0, Math.ceil((wEnd.getTime() - Date.now()) / 86400000));
    const allAdministered = rxs.every((r) => r.administered);
    const status: 'certified' | 'withdrawal' | 'pending' = allAdministered
      ? daysLeft > 0 ? 'withdrawal' : 'certified'
      : 'pending';
    
    const dbLot = dbLots.find(l => l.id === lotId);
    result.push({ 
      id: lotId, 
      name: dbLot?.name || latestRx.diagnosis || lotId, 
      species: dbLot?.species || '',
      quantity: dbLot?.quantity || 0,
      status, 
      count: rxs.length, 
      daysLeft 
    });
    handledLotIds.add(lotId);
  }

  // Add DB lots without prescriptions
  for (const dbLot of dbLots) {
    if (!handledLotIds.has(dbLot.id)) {
      result.push({
        id: dbLot.id,
        name: dbLot.name,
        species: dbLot.species || '',
        quantity: dbLot.quantity || 0,
        status: 'pending',
        count: 0,
        daysLeft: 0
      });
    }
  }

  return result;
}

export default function LotsScreen() {
  const { user } = useAuth();
  const [lots, setLots] = useState<ReturnType<typeof deriveLots>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        getFarmerPrescriptions(user.id).catch(() => []),
        getFarmerLots(user.id).then(res => res.lots).catch(() => [])
      ])
        .then(([rxs, dbLots]) => setLots(deriveLots(rxs, dbLots)))
        .catch(() => setLots([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.pageHeader}>
          <Text style={s.title}>Mes lots</Text>
          <Text style={s.subtitle}>({lots.length} lots actifs)</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
        ) : lots.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 30 }}>Aucun lot</Text>
        ) : (
          <View style={s.lotGrid}>
            {lots.map((lot, i) => {
              const cfg = statusCfg[lot.status];
              return (
                <TouchableOpacity key={lot.id || i} style={s.card} activeOpacity={0.7} onPress={() => router.push(`/(farmer)/lot-details?id=${lot.id}`)}>
                  <View style={s.cardPhoto}>
                    <Image source={require('@/assets/images/cattle.png')} style={{ width: '100%', height: '100%', borderRadius: Radii.sm }} resizeMode="cover" />
                  </View>
                  <Text style={s.lotId}>#{lot.id}</Text>
                  <Text style={s.lotBreed}>{lot.species || 'Bovin'}</Text>
                  <View style={[s.chip, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.chipText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  {lot.daysLeft > 0 && <Text style={s.daysLeft}>J-{lot.daysLeft}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={s.fab} 
        activeOpacity={0.9} 
        onPress={() => router.push('/(farmer)/add-lot')}
      >
        <Plus size={24} color={Colors.onPrimary} />
      </TouchableOpacity>
      
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/home')}>
          <Home size={24} color={Colors.onSurfaceDisabled} />
          <Text style={s.tabLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.tab}>
          <Package size={24} color={Colors.primary} />
          <Text style={s.tabLabelActive}>Mes Lots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/farmer-sales')}>
          <ShoppingCart size={24} color={Colors.onSurfaceDisabled} />
          <Text style={s.tabLabel}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/ai-assistant')}>
          <Bot size={24} color={Colors.onSurfaceDisabled} />
          <Text style={s.tabLabel}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={s.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  pageHeader: { marginBottom: Spacing.lg },
  title: { fontSize: 24, fontWeight: '600', color: Colors.onSurface, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 4 },
  
  lotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.sm, 
    marginBottom: Spacing.md, 
    borderWidth: 1, 
    borderColor: Colors.outline,
    ...Shadows.sm
  },
  cardPhoto: {
    height: 80,
    borderRadius: Radii.sm,
    backgroundColor: '#E6E2DA', // Fallback for cattle image
    marginBottom: Spacing.sm,
  },
  lotId: { fontFamily: Fonts?.mono, fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 2 },
  lotBreed: { fontSize: 13, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.sm },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full, marginTop: 4 },
  chipText: { fontSize: 11, fontWeight: '600' },
  daysLeft: { fontSize: 13, fontWeight: '800', color: Colors.warning, marginTop: Spacing.xs },
  
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
  
  fab: { 
    position: 'absolute', bottom: 90, right: Spacing.lg, 
    width: 56, height: 56, borderRadius: 28, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center', 
    ...Shadows.glow(Colors.primary) 
  },
});
