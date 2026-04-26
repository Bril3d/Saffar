/**
 * Farmer — Sales Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const farmerSales = [
  { id: 'FS-101', product: 'Poulet Fermier Bio', buyer: 'Yasmine T.', price: '9.500', qty: 2, date: '26 Avr', status: 'delivered' as const },
  { id: 'FS-100', product: 'Oeufs de Campagne', buyer: 'Ali K.', price: '4.200', qty: 5, date: '25 Avr', status: 'shipped' as const },
  { id: 'FS-099', product: 'Poulet Fermier Bio', buyer: 'Sonia M.', price: '9.500', qty: 1, date: '23 Avr', status: 'delivered' as const },
];
const statusCfg = {
  delivered: { label: 'Livré ✅', color: Colors.status.certified },
  shipped: { label: 'En cours 🚚', color: Colors.status.withdrawal },
};

export default function FarmerSalesScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Mes Ventes</Text>
        <Text style={s.subtitle}>{farmerSales.length} ventes récentes</Text>
        {farmerSales.map((sale, i) => (
          <View key={i} style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.saleId}>{sale.id}</Text>
              <Text style={s.productName}>{sale.product} × {sale.qty}</Text>
              <Text style={s.buyer}>{sale.buyer} · {sale.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={s.price}>{sale.price} TND</Text>
              <Text style={[s.status, { color: statusCfg[sale.status].color }]}>{statusCfg[sale.status].label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/lots')}><Text style={s.tabIcon}>🐔</Text><Text style={s.tabLabel}>Mes Lots</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>🛒</Text><Text style={s.tabLabelActive}>Ventes</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/profile')}><Text style={s.tabIcon}>👤</Text><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
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
  saleId: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant },
  productName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginTop: 2 },
  buyer: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  status: { fontSize: 11, fontWeight: '700' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
