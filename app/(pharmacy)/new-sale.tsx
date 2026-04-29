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
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { createDrugSale } from '@/services/api';
import { ArrowLeft, Pill, AlertTriangle, Plus, Minus, CheckCircle2 } from 'lucide-react-native';

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Vente</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Code ATC</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: J01CA04" 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={atc} 
          onChangeText={setAtc} 
          autoCapitalize="characters" 
        />
        
        {drug && (
          <View style={styles.drugInfoCard}>
            <Pill size={24} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.drugName}>{drug.name}</Text>
            </View>
            <View style={[styles.awareBadge, { backgroundColor: aw[drug.aware] + '1A' }]}>
              <View style={[styles.awareDot, { backgroundColor: aw[drug.aware] }]} />
              <Text style={[styles.awareText, { color: aw[drug.aware] }]}>{drug.aware}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>ID Vétérinaire</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: VET-2025" 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={vetId} 
          onChangeText={setVetId} 
        />

        <Text style={styles.label}>Numéro de lot de fabrication</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: LOT-2026-042" 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={batch} 
          onChangeText={setBatch} 
        />

        <Text style={styles.label}>Quantité (Doses)</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))} activeOpacity={0.7}>
            <Minus size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)} activeOpacity={0.7}>
            <Plus size={20} color={Colors.onSurface} />
          </TouchableOpacity>
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
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          activeOpacity={0.85} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <>
              <CheckCircle2 size={24} color={Colors.onPrimary} />
              <Text style={styles.submitText}>Enregistrer la Vente</Text>
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
  
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  
  label: { 
    fontSize: 13, fontWeight: '700', color: Colors.onSurfaceVariant, 
    textTransform: 'uppercase', letterSpacing: 0.5, 
    marginBottom: Spacing.xs, marginTop: Spacing.lg 
  },
  
  input: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.md, paddingVertical: 16, 
    fontSize: 16, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.outline,
  },

  drugInfoCard: { 
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, 
    backgroundColor: Colors.primary + '0A', 
    borderRadius: Radii.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '33',
    marginTop: Spacing.md 
  },
  drugName: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  
  awareBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full, gap: 4 },
  awareDot: { width: 6, height: 6, borderRadius: 3 },
  awareText: { fontSize: 12, fontWeight: '700' },
  
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.xs },
  qtyBtn: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  qtyValue: { fontSize: 24, fontWeight: '800', color: Colors.onSurface, minWidth: 40, textAlign: 'center' },
  
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.error + '1A',
    borderRadius: Radii.md, padding: Spacing.md,
    marginTop: Spacing.xl,
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
