/**
 * Farmer — Publish Product Screen
 * Lists certified lots ready to list on marketplace.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { publishProduct } from '@/services/api';

export default function PublishProductScreen() {
  const [lotId, setLotId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Poulets');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Poulets', 'Oeufs', 'Bovins', 'Ovins', 'Lait'];

  const handlePublish = async () => {
    if (!lotId.trim() || !title.trim() || !price.trim()) { setError('Lot ID, titre et prix requis'); return; }
    setError(''); setLoading(true);
    try {
      await publishProduct({
        lotId: lotId.trim(), title: title.trim(), description: desc.trim(),
        category, pricePerUnit: Number(price), unit: 'kg',
        quantityAvailable: Number(quantity) || 1, deliveryOptions: 'PICKUP',
      });
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Publier un Produit</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={s.label}>Lot ID</Text>
        <TextInput style={s.input} placeholder="ID du lot certifié" placeholderTextColor={Colors.outline} value={lotId} onChangeText={setLotId} />

        <Text style={s.label}>Titre du produit</Text>
        <TextInput style={s.input} placeholder="Ex: Poulet Fermier Bio" placeholderTextColor={Colors.outline} value={title} onChangeText={setTitle} />

        <Text style={s.label}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, marginBottom: Spacing.sm }}>
          {categories.map(c => (
            <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCategory(c)}>
              <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={s.label}>Prix (TND/kg)</Text>
        <View style={s.priceRow}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="0.000" placeholderTextColor={Colors.outline} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          <Text style={s.priceSuffix}>TND / kg</Text>
        </View>

        <Text style={s.label}>Quantité disponible (kg)</Text>
        <TextInput style={s.input} placeholder="Ex: 50" placeholderTextColor={Colors.outline} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

        <Text style={s.label}>Description</Text>
        <TextInput style={[s.input, s.textarea]} placeholder="Décrivez votre produit..." placeholderTextColor={Colors.outline} value={desc} onChangeText={setDesc} multiline numberOfLines={4} textAlignVertical="top" />

        <View style={s.blockchainInfo}>
          <Text style={s.blockchainIcon}>🔗</Text>
          <Text style={s.blockchainText}>Le produit sera lié à la traçabilité blockchain complète</Text>
        </View>

        {!!error && <Text style={{ color: Colors.onErrorContainer, textAlign: 'center', marginTop: Spacing.sm }}>⚠️ {error}</Text>}

        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.7 }]} activeOpacity={0.85} onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={s.submitText}>Publier sur le Marketplace</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.onSurface },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  lotCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lotCardActive: { backgroundColor: Colors.primaryFixed },
  lotInfo: { flex: 1 },
  lotName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  lotMeta: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  certBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  certText: { fontSize: 11, fontWeight: '700', color: Colors.status.certified },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  input: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  textarea: { minHeight: 100 },
  priceSuffix: { fontSize: 14, fontWeight: '600', color: Colors.onSurfaceVariant },
  blockchainInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryFixed, borderRadius: Radii.lg, padding: Spacing.md, marginTop: Spacing.lg },
  blockchainIcon: { fontSize: 18 },
  blockchainText: { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 18 },
  submitBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, ...Shadows.glow(Colors.primaryContainer) },
  submitText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
  chip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.primaryContainer },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },
});
