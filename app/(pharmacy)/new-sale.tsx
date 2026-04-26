/**
 * Pharmacy — New Sale Screen
 * ATC code, AWaRe badge, vet selector, quantity, biometric confirm.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const vets = ['Dr. Ben Ali', 'Dr. Trabelsi', 'Dr. Mansouri', 'Dr. Hamdi'];
const atcLookup: Record<string, { name: string; aware: 'Access' | 'Watch' | 'Reserve' }> = {
  J01CA04: { name: 'Amoxicilline', aware: 'Access' },
  J01MA90: { name: 'Enrofloxacine', aware: 'Watch' },
  J01XB01: { name: 'Colistine', aware: 'Reserve' },
};
const awareColors = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function NewSaleScreen() {
  const [atc, setAtc] = useState('');
  const [selectedVet, setSelectedVet] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [batch, setBatch] = useState('');
  const [error, setError] = useState('');
  const drug = atcLookup[atc.toUpperCase()];

  const handleSubmit = () => {
    if (!drug) { setError('Code ATC invalide'); return; }
    if (!selectedVet) { setError('Sélectionnez un vétérinaire'); return; }
    setError('');
    router.push('/(pharmacy)/sale-confirmed');
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Nouvelle Vente</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ATC Code */}
        <Text style={s.label}>Code ATC</Text>
        <View style={s.inputRow}>
          <TextInput style={s.input} placeholder="Ex: J01CA04" placeholderTextColor={Colors.outline} value={atc} onChangeText={setAtc} autoCapitalize="characters" />
        </View>
        {drug && (
          <View style={s.drugInfo}>
            <Text style={s.drugName}>{drug.name}</Text>
            <View style={[s.awareBadge, { backgroundColor: awareColors[drug.aware] + '18' }]}>
              <View style={[s.awareDot, { backgroundColor: awareColors[drug.aware] }]} />
              <Text style={[s.awareText, { color: awareColors[drug.aware] }]}>
                {drug.aware === 'Reserve' ? '⚠️ RESERVE' : drug.aware === 'Watch' ? '⚡ Watch' : '✅ Access'}
              </Text>
            </View>
          </View>
        )}

        {/* Vet Selector */}
        <Text style={s.label}>Vétérinaire prescripteur</Text>
        <View style={s.vetGrid}>
          {vets.map((v) => (
            <TouchableOpacity key={v} style={[s.vetCard, selectedVet === v && s.vetCardActive]} onPress={() => setSelectedVet(v)}>
              <Text style={[s.vetName, selectedVet === v && s.vetNameActive]}>{v}</Text>
              {selectedVet === v && <Text style={s.vetCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity */}
        <Text style={s.label}>Quantité</Text>
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={s.qtyBtnText}>−</Text></TouchableOpacity>
          <Text style={s.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(quantity + 1)}><Text style={s.qtyBtnText}>+</Text></TouchableOpacity>
        </View>

        {/* Batch */}
        <Text style={s.label}>Numéro de lot</Text>
        <TextInput style={s.input} placeholder="Ex: LOT-2026-042" placeholderTextColor={Colors.outline} value={batch} onChangeText={setBatch} />

        {/* Error */}
        {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}

        {/* Submit */}
        <TouchableOpacity style={s.submitBtn} activeOpacity={0.85} onPress={handleSubmit}>
          <Text style={s.submitIcon}>🔐</Text>
          <Text style={s.submitText}>Confirmer la Vente</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.onSurface },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  drugInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  drugName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  awareBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full, gap: 4 },
  awareDot: { width: 6, height: 6, borderRadius: 3 },
  awareText: { fontSize: 12, fontWeight: '700' },
  vetGrid: { gap: Spacing.sm },
  vetCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vetCardActive: { backgroundColor: Colors.primaryFixed },
  vetName: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  vetNameActive: { color: Colors.primary, fontWeight: '700' },
  vetCheck: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 22, fontWeight: '300', color: Colors.onSurface },
  qtyValue: { fontSize: 24, fontWeight: '800', color: Colors.onSurface, minWidth: 40, textAlign: 'center' },
  errorBox: { backgroundColor: Colors.errorContainer, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.md },
  errorText: { fontSize: 13, color: Colors.onErrorContainer, fontWeight: '500' },
  submitBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, ...Shadows.glow(Colors.primaryContainer) },
  submitIcon: { fontSize: 18 },
  submitText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
