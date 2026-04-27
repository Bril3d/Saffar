/**
 * Farmer — Publish Product Screen
 * Lists certified lots ready to list on marketplace.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getFarmerPublishableLots, publishProduct } from '@/services/api';
import type { PublishableLotResponse } from '@/services/types';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Tag, Scale } from 'lucide-react-native';

const categoryOptions = [
  { label: 'Poulets', value: 'POULTRY_MEAT' },
  { label: 'Oeufs', value: 'EGGS' },
  { label: 'Bovins', value: 'RED_MEAT' },
  { label: 'Ovins', value: 'RED_MEAT' },
  { label: 'Lait', value: 'DAIRY' },
  { label: 'Miel', value: 'HONEY' },
] as const;

export default function PublishProductScreen() {
  const params = useLocalSearchParams<{ prefillLotId?: string }>();
  const [selectedLotId, setSelectedLotId] = useState(params.prefillLotId || '');
  const [lots, setLots] = useState<PublishableLotResponse[]>([]);
  const [lotsLoading, setLotsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof categoryOptions)[number]['value']>('POULTRY_MEAT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getFarmerPublishableLots()
      .then((res) => {
        const eligibleLots = res.lots.filter((lot) => lot.eligibleForMarketplace);
        setLots(eligibleLots);
        if (eligibleLots.length > 0) {
          setSelectedLotId((prev) => prev || (params.prefillLotId ? params.prefillLotId : eligibleLots[0].lotId));
        }
      })
      .catch(() => setLots([]))
      .finally(() => setLotsLoading(false));
  }, [params.prefillLotId]);

  const selectedLot = lots.find((lot) => lot.lotId === selectedLotId);
  const netPerUnit = Number(price || '0') * 0.9;

  const handlePublish = async () => {
    if (!selectedLotId.trim()) { setError('Sélectionnez un lot éligible'); return; }
    if (!title.trim() || !price.trim()) { setError('Titre et prix requis'); return; }
    if (!Number(price) || Number(price) <= 0) { setError('Prix invalide'); return; }
    setError(''); setLoading(true);
    try {
      await publishProduct({
        lotId: selectedLotId.trim(), title: title.trim(), description: desc.trim(),
        category, pricePerUnit: Number(price), unit: 'KG',
        quantityAvailable: Number(quantity) || 1, deliveryOptions: 'PICKUP',
      });
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publier un Produit</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Lot éligible au Marketplace</Text>
        {lotsLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} />
        ) : lots.length === 0 ? (
          <View style={styles.emptyLots}>
            <AlertTriangle size={24} color={Colors.warning} />
            <Text style={styles.emptyLotsText}>Aucun lot éligible. Confirmez d'abord les traitements et attendez la fin du délai de retrait.</Text>
          </View>
        ) : (
          lots.map((lot) => (
            <TouchableOpacity
              key={lot.lotId}
              style={[styles.lotCard, selectedLotId === lot.lotId && styles.lotCardActive]}
              onPress={() => setSelectedLotId(lot.lotId)}
              activeOpacity={0.8}
            >
              <View style={styles.lotInfo}>
                <Text style={styles.lotName}>Lot #{lot.lotId}</Text>
                <Text style={styles.lotMeta}>
                  {lot.administeredTreatments}/{lot.totalTreatments} traitements confirmés
                </Text>
              </View>
              <View style={[styles.certBadge, lot.certified && styles.certBadgeCertified]}>
                {lot.certified ? <ShieldCheck size={14} color={Colors.success} /> : null}
                <Text style={[styles.certText, lot.certified && { color: Colors.success }]}>{lot.certified ? 'On-chain' : 'Trace'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.label}>Titre du produit</Text>
        <TextInput style={styles.input} placeholder="Ex: Poulet Fermier Bio" placeholderTextColor={Colors.onSurfaceVariant} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.sm }}>
          {categoryOptions.map((c) => (
            <TouchableOpacity key={c.value + c.label} style={[styles.chip, category === c.value && styles.chipActive]} onPress={() => setCategory(c.value)} activeOpacity={0.8}>
              <Text style={[styles.chipText, category === c.value && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Prix (TND/kg)</Text>
        <View style={styles.priceRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="0.000" placeholderTextColor={Colors.onSurfaceVariant} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          <View style={styles.priceSuffixBox}>
            <Tag size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.priceSuffix}>TND/kg</Text>
          </View>
        </View>

        <Text style={styles.label}>Quantité disponible (kg)</Text>
        <View style={styles.priceRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ex: 50" placeholderTextColor={Colors.onSurfaceVariant} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
          <View style={styles.priceSuffixBox}>
            <Scale size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.priceSuffix}>kg</Text>
          </View>
        </View>

        {Number(price) > 0 && (
          <View style={styles.netPreviewBox}>
            <Text style={styles.netPreviewLabel}>Revenu net estimé par unité:</Text>
            <Text style={styles.netPreviewValue}>{netPerUnit.toFixed(3)} TND</Text>
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} placeholder="Décrivez votre produit..." placeholderTextColor={Colors.onSurfaceVariant} value={desc} onChangeText={setDesc} multiline numberOfLines={4} textAlignVertical="top" />

        <View style={styles.blockchainInfo}>
          <ShieldCheck size={24} color={Colors.primary} />
          <Text style={styles.blockchainText}>Le produit sera lié à la traçabilité blockchain complète du lot sélectionné</Text>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <AlertTriangle size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.submitBtn, (loading || lotsLoading || lots.length === 0) && styles.submitBtnDisabled]} 
          activeOpacity={0.85} 
          onPress={handlePublish} 
          disabled={loading || lotsLoading || lots.length === 0}
        >
          {loading ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <>
              <CheckCircle2 size={24} color={Colors.onPrimary} />
              <Text style={styles.submitText}>Publier sur le Marketplace</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.outline,
    backgroundColor: Colors.surface,
  },
  backBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outline,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 120 },
  
  label: { 
    fontSize: 13, fontWeight: '700', color: Colors.onSurfaceVariant, 
    textTransform: 'uppercase', letterSpacing: 0.5, 
    marginBottom: Spacing.xs, marginTop: Spacing.lg 
  },
  
  emptyLots: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#FFF8E1', borderRadius: Radii.md, padding: Spacing.md,
    borderWidth: 1, borderColor: '#FFECB3',
  },
  emptyLotsText: { fontSize: 13, color: '#F57F17', flex: 1, lineHeight: 20 },
  
  lotCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.lg, 
    marginBottom: Spacing.sm, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  lotCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '0A' },
  lotInfo: { flex: 1 },
  lotName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  lotMeta: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  certBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerLow, 
    paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: Radii.full 
  },
  certBadgeCertified: { backgroundColor: Colors.success + '1A' },
  certText: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant },
  
  input: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.md, paddingVertical: 14, 
    fontSize: 15, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.outline,
  },
  textarea: { minHeight: 100, paddingTop: 14 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceSuffixBox: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerLow, 
    paddingHorizontal: 12, paddingVertical: 10, 
    borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.outline,
  },
  priceSuffix: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  
  netPreviewBox: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.success + '0A', 
    borderRadius: Radii.md, padding: Spacing.md, 
    marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.success + '33',
  },
  netPreviewLabel: { fontSize: 13, color: Colors.onSurfaceVariant },
  netPreviewValue: { fontSize: 16, fontWeight: '800', color: Colors.success },
  
  chip: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.full, 
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.outline,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },
  
  blockchainInfo: { 
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, 
    backgroundColor: Colors.primary + '0A', 
    borderRadius: Radii.lg, padding: Spacing.md, 
    marginTop: Spacing.xl,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  blockchainText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 20, fontWeight: '600' },
  
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.error + '1A',
    borderRadius: Radii.md, padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: { fontSize: 14, color: Colors.error, fontWeight: '500', flex: 1 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.outline,
    ...Shadows.lg,
  },
  submitBtn: { 
    backgroundColor: Colors.primary, 
    borderRadius: Radii.full, 
    paddingVertical: 18, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, 
    ...Shadows.md 
  },
  submitBtnDisabled: {
    backgroundColor: Colors.onSurfaceDisabled,
    opacity: 0.5,
  },
  submitText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
