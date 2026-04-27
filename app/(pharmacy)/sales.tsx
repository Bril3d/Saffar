/**
 * Pharmacy — Sales History (dynamic from API)
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getRecentDrugSales } from '@/services/api';
import type { DrugSaleResponse } from '@/services/types';
import { Home, ShoppingCart, Bell, User } from 'lucide-react-native';


const aw: Record<string, string> = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function SalesScreen() {
  const [sales, setSales] = useState<DrugSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentDrugSales().then(setSales).catch(() => setSales([])).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Historique des Ventes</Text>
        <Text style={s.subtitle}>{sales.length} ventes enregistrées</Text>

        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} /> :
          sales.length === 0 ? <Text style={s.empty}>Aucune vente</Text> :
          sales.map((sale, i) => (
            <View key={sale.sale_id || i} style={s.card}>
              <View style={s.cardLeft}>
                <Text style={s.saleId}>{sale.sale_id?.slice(0, 12)}</Text>
                <Text style={s.saleDrug}>{sale.atc_code} · x{sale.quantity}</Text>
                <Text style={s.saleMeta}>Lot: {sale.batch_number}</Text>
              </View>
              <View style={s.cardRight}>
                <View style={[s.awareBadge, { backgroundColor: (aw[sale.aware_class] || Colors.outline) + '18' }]}>
                  <Text style={[s.awareText, { color: aw[sale.aware_class] || Colors.outline }]}>{sale.aware_class}</Text>
                </View>
                <Text style={s.saleDate}>{new Date(sale.created_at).toLocaleDateString('fr-FR')}</Text>
              </View>
            </View>
          ))
        }
      </ScrollView>

      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><ShoppingCart size={24} color={Colors.primary} /><Text style={s.tabLabelActive}>Ventes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/alerts')}><Bell size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Alertes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/profile')}><User size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  empty: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 30 },
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
