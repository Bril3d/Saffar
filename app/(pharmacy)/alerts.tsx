/**
 * Pharmacy — Alerts Screen (Dynamic from API)
 * Generates alerts from real drug sales data.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getRecentDrugSales } from '@/services/api';
import type { DrugSaleResponse } from '@/services/types';
import { Home, ShoppingCart, Bell, User, AlertTriangle, ShieldAlert, TrendingUp, Info, Pill } from 'lucide-react-native';

function generateAlerts(sales: DrugSaleResponse[]) {
  const alerts: { type: string; title: string; desc: string; time: string; icon: any; color: string }[] = [];

  const reserveSales = sales.filter(s => s.aware_class === 'Reserve');
  reserveSales.forEach(s => {
    alerts.push({
      type: 'reserve',
      title: 'Vente antibiotique Reserve détectée',
      desc: `${s.atc_code} · Lot ${s.batch_number} · ${s.quantity} dose(s)`,
      time: new Date(s.created_at).toLocaleDateString('fr-FR'),
      icon: ShieldAlert,
      color: Colors.aware.reserve,
    });
  });

  const watchSales = sales.filter(s => s.aware_class === 'Watch');
  if (watchSales.length > 0) {
    alerts.push({
      type: 'watch',
      title: `${watchSales.length} vente(s) Watch ce mois`,
      desc: 'Surveillance OMS recommandée pour les antibiotiques Watch',
      time: 'Ce mois',
      icon: AlertTriangle,
      color: Colors.aware.watch,
    });
  }

  if (sales.length > 5) {
    alerts.push({
      type: 'anomaly',
      title: 'Volume de ventes élevé',
      desc: `${sales.length} ventes enregistrées récemment`,
      time: 'Récent',
      icon: TrendingUp,
      color: Colors.warning,
    });
  }

  const uniqueVets = new Set(sales.map(s => s.vet_id)).size;
  if (uniqueVets > 0) {
    alerts.push({
      type: 'info',
      title: `${uniqueVets} vétérinaire(s) actif(s)`,
      desc: 'Réseau Farm Care fonctionnel',
      time: 'Actuel',
      icon: Info,
      color: Colors.primary,
    });
  }

  return alerts;
}

export default function AlertsScreen() {
  const [sales, setSales] = useState<DrugSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentDrugSales()
      .then(setSales)
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  }, []);

  const alerts = generateAlerts(sales);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Alertes</Text>
            <Text style={styles.subtitle}>{alerts.length} notifications actives</Text>
          </View>
          <View style={styles.alertCountBadge}>
            <Text style={styles.alertCountText}>{alerts.length}</Text>
          </View>
        </View>

        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} /> :
          alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>Aucune alerte</Text>
              <Text style={styles.emptySubtext}>Tout est en ordre</Text>
            </View>
          ) :
          alerts.map((a, i) => {
            const IconComp = a.icon;
            return (
              <View key={i} style={[styles.card, a.type === 'reserve' && styles.cardUrgent]}>
                <View style={[styles.alertIconBox, { backgroundColor: a.color + '1A' }]}>
                  <IconComp size={20} color={a.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  <Text style={styles.alertDesc}>{a.desc}</Text>
                  <Text style={styles.alertTime}>{a.time}</Text>
                </View>
              </View>
            );
          })
        }
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(pharmacy)/home')}>
          <Home size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(pharmacy)/sales')}>
          <ShoppingCart size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <Bell size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>Alertes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(pharmacy)/profile')}>
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
  alertCountBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.error + '1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.error + '33',
  },
  alertCountText: { fontSize: 17, fontWeight: '800', color: Colors.error },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  emptyText: { color: Colors.onSurfaceVariant, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.outlineVariant, fontSize: 14 },

  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.lg, 
    marginBottom: Spacing.md, 
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  cardUrgent: { borderLeftWidth: 4, borderLeftColor: Colors.aware.reserve },
  alertIconBox: { 
    width: 44, height: 44, borderRadius: 22, 
    alignItems: 'center', justifyContent: 'center' 
  },
  alertTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  alertDesc: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  alertTime: { fontSize: 12, color: Colors.outlineVariant, marginTop: 6, fontWeight: '600' },
  
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
