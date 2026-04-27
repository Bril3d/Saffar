/**
 * Farmer — Sales Screen (dynamic from API)
 * Premium order management with status progression.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getOrders, updateOrderStatus } from '@/services/api';
import type { OrderResponse } from '@/services/types';
import { Home, Package, ShoppingCart, User, Clock, CheckCircle2, Truck, XCircle, ArrowRight, Bot } from 'lucide-react-native';

const statusCfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: 'En attente', color: Colors.warning, bg: '#FFF8E1', icon: <Clock size={14} color={Colors.warning} /> },
  CONFIRMED: { label: 'Confirmée', color: Colors.primary, bg: Colors.primary + '1A', icon: <CheckCircle2 size={14} color={Colors.primary} /> },
  PREPARING: { label: 'Préparation', color: Colors.primary, bg: Colors.primary + '1A', icon: <Package size={14} color={Colors.primary} /> },
  READY: { label: 'Prêt', color: Colors.success, bg: Colors.success + '1A', icon: <CheckCircle2 size={14} color={Colors.success} /> },
  DELIVERED: { label: 'Livré', color: Colors.success, bg: Colors.success + '1A', icon: <Truck size={14} color={Colors.success} /> },
  CANCELLED: { label: 'Annulée', color: Colors.error, bg: Colors.error + '1A', icon: <XCircle size={14} color={Colors.error} /> },
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'DELIVERED',
};

export default function FarmerSalesScreen() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    getOrders()
      .then((r) => setOrders(r.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleAdvance = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, next);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: next } : o));
    } catch {}
    finally { setUpdating(null); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Mes Ventes</Text>
            <Text style={styles.subtitle}>{orders.length} commandes</Text>
          </View>
        </View>
        
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingCart size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>Aucune vente</Text>
          </View>
        ) : orders.map((order) => {
          const cfg = statusCfg[order.status] || { label: order.status, color: Colors.onSurfaceVariant, bg: Colors.surfaceContainerLow, icon: null };
          const nextStatus = NEXT_STATUS[order.status];
          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.saleId}>#{order.id?.slice(0, 8)}</Text>
                  <Text style={styles.productName}>{order.product_title} × {order.quantity}</Text>
                  <Text style={styles.buyer}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.price}>{order.farmer_payout?.toFixed(3)} TND</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    {cfg.icon}
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
              {nextStatus && (
                <TouchableOpacity
                  style={styles.advanceBtn}
                  onPress={() => handleAdvance(order.id, order.status)}
                  disabled={updating === order.id}
                  activeOpacity={0.8}
                >
                  <Text style={styles.advanceBtnText}>{updating === order.id ? 'Mise à jour...' : `Avancer → ${statusCfg[nextStatus]?.label || nextStatus}`}</Text>
                  <ArrowRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
      
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/home')}>
          <Home size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/lots')}>
          <Package size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Mes Lots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <ShoppingCart size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/ai-assistant')}>
          <Bot size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/profile')}>
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
    borderRadius: Radii.lg,
    padding: Spacing.lg, 
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  saleId: { fontSize: 13, fontFamily: Fonts?.mono, fontWeight: '700', color: Colors.onSurfaceVariant },
  productName: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginTop: 4 },
  buyer: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  price: { fontSize: 17, fontWeight: '800', color: Colors.primary },
  
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: Radii.full 
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  advanceBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary + '0A', 
    borderRadius: Radii.full, 
    paddingVertical: 10,
    marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  advanceBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  
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
