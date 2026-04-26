/**
 * Vet — New Prescription Screen
 * Drug dropdown, farmer selector, diagnosis, posology, withdrawal days.
 */
import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { createPrescription } from '@/services/api';

const drugs = [
  { name: 'Amoxicilline 500mg', atc: 'J01CA04', aware: 'Access', minWithdrawal: 5 },
  { name: 'Enrofloxacine 100mg', atc: 'J01MA90', aware: 'Watch', minWithdrawal: 14 },
  { name: 'Colistine 2MUI', atc: 'J01XB01', aware: 'Reserve', minWithdrawal: 7 },
];
// Farmer ID input replaces the static list
const awareColors = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function NewPrescriptionScreen() {
  const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
  const [saleId, setSaleId] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [lotId, setLotId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [dosage, setDosage] = useState('');
  const [withdrawalDays, setWithdrawalDays] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const drug = selectedDrug !== null ? drugs[selectedDrug] : null;

  const handleSubmit = async () => {
    if (!drug) { setError('Sélectionnez un médicament'); return; }
    if (!saleId.trim()) { setError('Entrez l\'ID de vente'); return; }
    if (!farmerId.trim()) { setError('Entrez l\'ID de l\'éleveur'); return; }
    if (!lotId.trim()) { setError('Entrez l\'ID du lot'); return; }
    if (Number(withdrawalDays) < (drug?.minWithdrawal || 0)) { setError(`Minimum ${drug.minWithdrawal} jours pour ${drug.name}`); return; }
    setError(''); setLoading(true);
    try {
      await createPrescription({
        saleId: saleId.trim(), farmerId: farmerId.trim(), animalLotId: lotId.trim(),
        diagnosis: diagnosis.trim(), dosage: Number(dosage) || 1, withdrawalDays: Number(withdrawalDays),
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
          <Text style={s.headerTitle}>Nouvelle Prescription</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* AI Card hint */}
        <View style={s.aiHint}>
          <Text style={s.aiHintIcon}>🤖</Text>
          <Text style={s.aiHintText}>Utilisez l'assistant IA pour les recommandations</Text>
        </View>

        {/* Drug selector */}
        <Text style={s.label}>Médicament</Text>
        {drugs.map((d, i) => (
          <TouchableOpacity key={i} style={[s.drugCard, selectedDrug === i && s.drugCardActive]} onPress={() => { setSelectedDrug(i); setWithdrawalDays(String(d.minWithdrawal)); }}>
            <View style={{ flex: 1 }}>
              <Text style={[s.drugName, selectedDrug === i && s.drugNameActive]}>{d.name}</Text>
              <Text style={s.drugAtc}>{d.atc}</Text>
            </View>
            <View style={[s.awareBadge, { backgroundColor: (awareColors as any)[d.aware] + '18' }]}>
              <Text style={[s.awareText, { color: (awareColors as any)[d.aware] }]}>{d.aware}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Sale ID */}
        <Text style={s.label}>ID de Vente</Text>
        <TextInput style={s.input} placeholder="ID de la vente associée" placeholderTextColor={Colors.outline} value={saleId} onChangeText={setSaleId} />

        {/* Farmer ID */}
        <Text style={s.label}>ID Éleveur</Text>
        <TextInput style={s.input} placeholder="ID de l'éleveur" placeholderTextColor={Colors.outline} value={farmerId} onChangeText={setFarmerId} />

        {/* Lot ID */}
        <Text style={s.label}>Identifiant du lot</Text>
        <TextInput style={s.input} placeholder="Ex: LOT-1234" placeholderTextColor={Colors.outline} value={lotId} onChangeText={setLotId} />

        {/* Diagnosis */}
        <Text style={s.label}>Diagnostic</Text>
        <TextInput style={[s.input, s.textarea]} placeholder="Décrivez les symptômes et le diagnostic..." placeholderTextColor={Colors.outline} value={diagnosis} onChangeText={setDiagnosis} multiline numberOfLines={3} textAlignVertical="top" />

        {/* Dosage */}
        <Text style={s.label}>Posologie (mg/kg)</Text>
        <TextInput style={s.input} placeholder="Ex: 15" placeholderTextColor={Colors.outline} value={dosage} onChangeText={setDosage} keyboardType="numeric" />

        {/* Withdrawal */}
        <Text style={s.label}>Jours de retrait</Text>
        <View style={s.withdrawalRow}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="Jours" placeholderTextColor={Colors.outline} value={withdrawalDays} onChangeText={setWithdrawalDays} keyboardType="numeric" />
          {drug && <Text style={s.minDays}>min = {drug.minWithdrawal} jours pour {drug.name}</Text>}
        </View>

        {!!error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}

        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.7 }]} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <><Text style={s.submitIcon}>🔐</Text><Text style={s.submitText}>Confirmer la Prescription</Text></>}
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  aiHint: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md },
  aiHintIcon: { fontSize: 20 },
  aiHintText: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500', flex: 1 },
  drugCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center' },
  drugCardActive: { backgroundColor: Colors.primaryFixed },
  drugName: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  drugNameActive: { color: Colors.primary, fontWeight: '700' },
  drugAtc: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  awareBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  awareText: { fontSize: 11, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingHorizontal: 16, paddingVertical: 10 },
  chipActive: { backgroundColor: Colors.primaryContainer },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },
  input: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  textarea: { minHeight: 80 },
  withdrawalRow: { gap: Spacing.sm },
  minDays: { fontSize: 12, color: Colors.status.withdrawal, fontWeight: '600', marginTop: 4 },
  errorBox: { backgroundColor: Colors.errorContainer, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.md },
  errorText: { fontSize: 13, color: Colors.onErrorContainer, fontWeight: '500' },
  submitBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, ...Shadows.glow(Colors.primaryContainer) },
  submitIcon: { fontSize: 18 },
  submitText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
