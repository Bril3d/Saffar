/**
 * SAFAR Chain — Consumer Home Screen
 * Product grid, search, category filters, blockchain banner.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const categories = ['Tous', 'Poulets', 'Oeufs', 'Bovins', 'Ovins', 'Lait'];

const products = [
  { name: 'Poulet Fermier Bio', farm: 'Ferme El Baraka', price: '9.500', trust: 98, aware: 'Access' as const },
  { name: 'Oeufs de Campagne', farm: 'Ferme Sidi Bou', price: '4.200', trust: 95, aware: 'Access' as const },
  { name: 'Viande Bovine', farm: 'Ferme Al Waha', price: '25.000', trust: 92, aware: 'Watch' as const },
  { name: 'Lait Frais', farm: 'Ferme Ennour', price: '2.800', trust: 97, aware: 'Access' as const },
];

const awareColors = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

function ProductCard({ name, farm, price, trust, aware }: typeof products[0]) {
  const trustColor = trust >= 90 ? Colors.status.certified : trust >= 70 ? Colors.status.withdrawal : Colors.status.rejected;
  return (
    <View style={styles.productCard}>
      {/* Placeholder image */}
      <View style={styles.productImage}>
        <Text style={styles.productEmoji}>🥩</Text>
      </View>
      {/* Trust badge */}
      <View style={[styles.trustBadge, { backgroundColor: trustColor }]}>
        <Text style={styles.trustText}>{trust}</Text>
      </View>
      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={1}>{name}</Text>
        <Text style={styles.productFarm} numberOfLines={1}>{farm}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{price} TND</Text>
          <View style={[styles.awareMini, { backgroundColor: awareColors[aware] + '18' }]}>
            <Text style={[styles.awareMiniText, { color: awareColors[aware] }]}>{aware}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.orderBtn} activeOpacity={0.85} onPress={() => router.push('/(consumer)/product-detail')}>
          <Text style={styles.orderBtnText}>Voir détails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ConsumerHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <Text style={styles.headerSubtitle}>Produits certifiés blockchain</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>C</Text></View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Rechercher un produit..." placeholderTextColor={Colors.outline} />
          <TouchableOpacity style={styles.locationChip}>
            <Text style={styles.locationText}>📍 Tunis</Text>
          </TouchableOpacity>
        </View>

        {/* Blockchain banner */}
        <View style={styles.blockchainBanner}>
          <Text style={styles.bannerIcon}>🔗</Text>
          <Text style={styles.bannerText}>Tous les produits sont certifiés blockchain</Text>
          <Text style={styles.bannerCheck}>✅</Text>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((c, i) => (
            <TouchableOpacity key={i} style={[styles.chip, i === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {products.map((p, i) => <ProductCard key={i} {...p} />)}
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabIconActive}>🏠</Text><Text style={styles.tabLabelActive}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(consumer)/scanner')}><Text style={styles.tabIcon}>📷</Text><Text style={styles.tabLabel}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(consumer)/cart')}><Text style={styles.tabIcon}>🛒</Text><Text style={styles.tabLabel}>Panier</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(consumer)/orders')}><Text style={styles.tabIcon}>📦</Text><Text style={styles.tabLabel}>Commandes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(consumer)/profile')}><Text style={styles.tabIcon}>👤</Text><Text style={styles.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: Spacing.md },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.onSurface },
  headerSubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.onPrimary },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, height: 48, marginBottom: Spacing.md, gap: Spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.onSurface },
  locationChip: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  locationText: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },

  // Banner
  blockchainBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryFixed, borderRadius: Radii.lg, padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bannerIcon: { fontSize: 18 },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.primary },
  bannerCheck: { fontSize: 16 },

  // Chips
  chipRow: { gap: Spacing.sm, marginBottom: Spacing.lg },
  chip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.primaryContainer },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },

  // Product Grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'space-between' },
  productCard: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
    position: 'relative',
  },
  productImage: { height: 100, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 36 },
  trustBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  trustText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  productContent: { padding: Spacing.sm },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  productFarm: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  productPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  awareMini: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radii.full },
  awareMiniText: { fontSize: 9, fontWeight: '700' },
  orderBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 8, alignItems: 'center', marginTop: Spacing.sm },
  orderBtnText: { fontSize: 12, fontWeight: '700', color: Colors.onPrimary },

  // Tab bar
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { fontSize: 20 },
  tabLabel: { fontSize: 9, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 9, fontWeight: '700', color: Colors.primary },
});
