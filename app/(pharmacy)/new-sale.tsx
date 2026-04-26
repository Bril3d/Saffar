/**
 * Pharmacy — New Sale Screen
 * Calls POST /api/drugs/sale on submit.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { createDrugSale } from '@/services/api';

const atcLookup: Record<string, { name: string; aware: 'Access' | 'Watch' | 'Reserve' }> = {
  J01CA04: { name: 'Amoxicilline', aware: 'Access' },
  J01MA90: { name: 'Enrofloxacine', aware: 'Watch' },
  J01XB01: { name: 'Colistine', aware: 'Reserve' },
};
const aw = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function NewSaleScreen() {
  const [atc, setAtc] = useState('');
  const [vetId, setVetId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [batch, setBatch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const drug = atcLookup[atc.toUpperCase()];

  const handleSubmit = async () => {
    if (!drug) { setError('Code ATC invalide'); return; }
    if (!vetId.trim()) { setError("Entrez l'ID du vétérinaire"); return; }
    if (!batch.trim()) { setError('Entrez le numéro de lot'); return; }
    setError(''); setLoading(true);
    try {
      const r = await createDrugSale({ vetId: vetId.trim(), atcCode: atc.toUpperCase(), batchNumber: batch.trim(), quantity, awareClass: drug.aware });
      router.push({ pathname: '/(pharmacy)/sale-confirmed', params: { saleId: r.saleId, txHash: r.txHash, awareClass: r.awareClass } } as any);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.c}><StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.sc} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.hd}><TouchableOpacity onPress={() => router.back()} style={s.bk}><Text style={s.bi}>←</Text></TouchableOpacity><Text style={s.ht}>Nouvelle Vente</Text><View style={{ width: 40 }} /></View>
        <Text style={s.lb}>Code ATC</Text>
        <TextInput style={s.ip} placeholder="Ex: J01CA04" placeholderTextColor={Colors.outline} value={atc} onChangeText={setAtc} autoCapitalize="characters" />
        {drug && <View style={s.di}><Text style={s.dn}>{drug.name}</Text><View style={[s.ab, { backgroundColor: aw[drug.aware] + '18' }]}><View style={[s.ad, { backgroundColor: aw[drug.aware] }]} /><Text style={[s.at, { color: aw[drug.aware] }]}>{drug.aware}</Text></View></View>}
        <Text style={s.lb}>ID Vétérinaire</Text>
        <TextInput style={s.ip} placeholder="ID du vétérinaire" placeholderTextColor={Colors.outline} value={vetId} onChangeText={setVetId} />
        <Text style={s.lb}>Quantité</Text>
        <View style={s.qr}><TouchableOpacity style={s.qb} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={s.qt}>−</Text></TouchableOpacity><Text style={s.qv}>{quantity}</Text><TouchableOpacity style={s.qb} onPress={() => setQuantity(quantity + 1)}><Text style={s.qt}>+</Text></TouchableOpacity></View>
        <Text style={s.lb}>Numéro de lot</Text>
        <TextInput style={s.ip} placeholder="Ex: LOT-2026-042" placeholderTextColor={Colors.outline} value={batch} onChangeText={setBatch} />
        {!!error && <View style={s.eb}><Text style={s.et}>⚠️ {error}</Text></View>}
        <TouchableOpacity style={[s.sb, loading && { opacity: 0.7 }]} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <><Text style={{ fontSize: 18 }}>🔐</Text><Text style={s.st}>Confirmer la Vente</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  sc: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  hd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  bk: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  bi: { fontSize: 20, color: Colors.onSurface },
  ht: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  lb: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  ip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  di: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  dn: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  ab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full, gap: 4 },
  ad: { width: 6, height: 6, borderRadius: 3 },
  at: { fontSize: 12, fontWeight: '700' },
  qr: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qb: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  qt: { fontSize: 22, fontWeight: '300', color: Colors.onSurface },
  qv: { fontSize: 24, fontWeight: '800', color: Colors.onSurface, minWidth: 40, textAlign: 'center' },
  eb: { backgroundColor: Colors.errorContainer, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.md },
  et: { fontSize: 13, color: Colors.onErrorContainer, fontWeight: '500' },
  sb: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, ...Shadows.glow(Colors.primaryContainer) },
  st: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
