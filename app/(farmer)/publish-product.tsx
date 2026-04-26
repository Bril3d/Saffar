/**
 * Farmer — Publish Product Screen
 * Lists certified lots ready to list on marketplace.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const certifiedLots = [
  { id: '#1234', name: 'Poulets de chair', certDate: '20 Avr 2026' },
  { id: '#1237', name: 'Oeufs bio', certDate: '18 Avr 2026' },
];

export default function PublishProductScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Publier un Produit</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Certified lots */}
        <Text style={s.label}>Lots certifiés disponibles</Text>
        {certifiedLots.map((lot) => (
          <TouchableOpacity key={lot.id} style={[s.lotCard, selected === lot.id && s.lotCardActive]} onPress={() => setSelected(lot.id)}>
            <View style={s.lotInfo}>
              <Text style={s.lotName}>{lot.name}</Text>
              <Text style={s.lotMeta}>Lot {lot.id} · Certifié le {lot.certDate}</Text>
            </View>
            <View style={s.certBadge}>
              <Text style={s.certText}>✅ Certifié</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Price */}
        <Text style={s.label}>Prix (TND)</Text>
        <View style={s.priceRow}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="0.000" placeholderTextColor={Colors.outline} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          <Text style={s.priceSuffix}>TND / kg</Text>
        </View>

        {/* Description */}
        <Text style={s.label}>Description du produit</Text>
        <TextInput style={[s.input, s.textarea]} placeholder="Décrivez votre produit pour les consommateurs..." placeholderTextColor={Colors.outline} value={desc} onChangeText={setDesc} multiline numberOfLines={4} textAlignVertical="top" />

        {/* Blockchain info */}
        <View style={s.blockchainInfo}>
          <Text style={s.blockchainIcon}>🔗</Text>
          <Text style={s.blockchainText}>Le produit sera lié à l'historique complet de traçabilité blockchain (prescriptions, retraits, certifications)</Text>
        </View>

        <TouchableOpacity style={[s.submitBtn, !selected && { opacity: 0.5 }]} activeOpacity={0.85} onPress={() => router.back()} disabled={!selected}>
          <Text style={s.submitText}>Publier sur le Marketplace</Text>
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
});
