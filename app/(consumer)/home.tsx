/**
 * SAFAR Chain — Consumer Home Screen
 * Product grid, search, category filters, blockchain banner.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getProducts } from '@/services/api';
import type { ProductResponse } from '@/services/types';
import { useAuth } from '@/store/authStore';
import { FileText, Home, ScanLine, User, ShoppingCart, Store, Search, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

const productImages = [
  require('@/assets/images/beef.png'),
  require('@/assets/images/sheep.png'),
  require('@/assets/images/eggs.png'),
  require('@/assets/images/honey.png'),
];

function getImageForIndex(index: number) {
  return productImages[index % productImages.length];
}

const categories = [
  { label: 'Tous', value: undefined },
  { label: 'Poulets', value: 'POULTRY_MEAT' },
  { label: 'Oeufs', value: 'EGGS' },
  { label: 'Bovins', value: 'RED_MEAT' },
  { label: 'Ovins', value: 'RED_MEAT' },
  { label: 'Lait', value: 'DAIRY' },
  { label: 'Miel', value: 'HONEY' },
] as const;

function ProductCard({ product, index }: { product: ProductResponse; index: number }) {
  const trust = Math.round(product.avg_rating * 20) || 0;
  const trustColor = trust >= 90 ? Colors.success : trust >= 70 ? Colors.warning : Colors.error;
  
  return (
    <View style={styles.productCard}>
      <View style={styles.productImage}>
         <Image source={getImageForIndex(index)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
      {trust > 0 && (
        <View style={[styles.trustBadge, { backgroundColor: trustColor }]}>
          <Text style={styles.trustText}>{trust}</Text>
        </View>
      )}
      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.productFarm} numberOfLines={1}>{product.farmer_name}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{product.price_per_unit.toFixed(3)} TND</Text>
        </View>
        <Text style={styles.productMeta}>Lot: {product.lot_id}</Text>
        <View style={styles.chainMetaContainer}>
          <ShieldCheck size={14} color={Colors.primary} />
          <Text style={styles.chainMeta}>{product.on_chain_certified ? 'Certifié on-chain' : 'Trace vérifiée'}</Text>
        </View>
        <TouchableOpacity style={styles.orderBtn} activeOpacity={0.85} onPress={() => router.push({ pathname: '/(consumer)/product-detail', params: { id: product.id } } as any)}>
          <Text style={styles.orderBtnText}>Voir détails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ConsumerHomeScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(0);

  useEffect(() => {
    setLoading(true);
    getProducts({ category: categories[selectedCat]?.value })
      .then((r) => setProducts(r.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.roleChip}>
              <ShoppingCart size={16} color={Colors.primary} />
              <Text style={styles.roleChipText}>Consommateur</Text>
            </View>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'C'}</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSubtitle}>Produits certifiés de la ferme</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.onSurfaceVariant} />
          <TextInput style={styles.searchInput} placeholder="Rechercher un produit..." placeholderTextColor={Colors.onSurfaceVariant} />
          <TouchableOpacity style={styles.locationChip} activeOpacity={0.7}>
            <MapPin size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.locationText}>Tunis</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.blockchainBanner}>
          <ShieldCheck size={24} color={Colors.primary} />
          <Text style={styles.bannerText}>Tous les produits sont certifiés sur blockchain</Text>
          <CheckCircle2 size={20} color={Colors.primary} />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((c, i) => (
            <TouchableOpacity key={i} activeOpacity={0.8} style={[styles.chip, selectedCat === i && styles.chipActive]} onPress={() => setSelectedCat(i)}>
              <Text style={[styles.chipText, selectedCat === i && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} /> :
          products.length === 0 ? (
            <View style={styles.emptyState}>
              <Store size={48} color={Colors.outlineVariant} />
              <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: Spacing.md }}>Aucun produit disponible</Text>
            </View>
          ) :
          <View style={styles.productGrid}>
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </View>
        }
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <Home size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(consumer)/scanner')}>
          <ScanLine size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(consumer)/cart')}>
          <ShoppingCart size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Panier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(consumer)/orders')}>
          <FileText size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Commandes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(consumer)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 120 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  roleChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary + '1A', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 6, 
    borderRadius: Radii.full,
    gap: Spacing.xs,
  },
  roleChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  titleContainer: { marginBottom: Spacing.lg },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 4 },
  
  avatar: { 
    width: 40, height: 40, borderRadius: Radii.full, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center' 
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimary },

  // Search
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.md, 
    height: 52, 
    marginBottom: Spacing.md, 
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.onSurface },
  locationChip: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerLow, 
    borderRadius: Radii.full, 
    paddingHorizontal: 12, paddingVertical: 6 
  },
  locationText: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },

  // Banner
  blockchainBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary + '1A', 
    borderRadius: Radii.md, 
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Chips
  chipRow: { gap: Spacing.sm, paddingBottom: Spacing.sm, marginBottom: Spacing.md },
  chip: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.full, 
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.outline,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },

  // Product Grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'space-between' },
  productCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
    position: 'relative',
  },
  productImage: { height: 100, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  trustBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  trustText: { fontSize: 10, fontWeight: '800', color: Colors.onPrimary },
  productContent: { padding: Spacing.sm },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  productFarm: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  productPrice: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  productMeta: { fontSize: 11, fontFamily: Fonts?.mono, color: Colors.onSurfaceVariant, marginTop: 6 },
  
  chainMetaContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  chainMeta: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  
  orderBtn: { 
    backgroundColor: Colors.primary, 
    borderRadius: Radii.full, 
    paddingVertical: 10, 
    alignItems: 'center', 
    marginTop: Spacing.md 
  },
  orderBtnText: { fontSize: 13, fontWeight: '700', color: Colors.onPrimary },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },

  // Tab bar
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
