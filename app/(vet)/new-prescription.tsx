/**
 * Vet — New Prescription Screen
 * Fetches Vet's available drug sales from pharmacy to prescribe.
 * Auto-fills Farmer and Lot ID if passed via navigation.
 */
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { createPrescription, getFarmerLots, getRecentDrugSales } from '@/services/api';
import { useAuth } from '@/store/authStore';
import { Bot, ArrowLeft, Search, CheckCircle2, AlertTriangle, Pill } from 'lucide-react-native';
import type { DrugSaleResponse } from '@/services/types';

const awareColors = { Access: Colors.aware.access, Watch: Colors.aware.watch, Reserve: Colors.aware.reserve };

export default function NewPrescriptionScreen() {
  const params = useLocalSearchParams<{ prefillFarmerId?: string, prefillLotId?: string }>();
  const { user } = useAuth();
  
  const [availableDrugs, setAvailableDrugs] = useState<DrugSaleResponse[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number | null>(null);
  const [farmerId, setFarmerId] = useState(params.prefillFarmerId || '');
  const [lotId, setLotId] = useState(params.prefillLotId || '');
  
  const [diagnosis, setDiagnosis] = useState('');
  const [dosage, setDosage] = useState('');
  const [withdrawalDays, setWithdrawalDays] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [farmerLots, setFarmerLots] = useState<any[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);

  useEffect(() => {
    // Fetch available drugs
    getRecentDrugSales()
      .then(sales => {
        // Filter out only the ones belonging to this vet
        const vetSales = sales.filter(s => s.vet_id === user?.id);
        setAvailableDrugs(vetSales);
      })
      .catch(() => setAvailableDrugs([]))
      .finally(() => setLoadingDrugs(false));

    // If we have a prefilled farmer, fetch their lots
    if (params.prefillFarmerId) {
      handleFetchLots(params.prefillFarmerId);
    }
  }, [params.prefillFarmerId, user?.id]);

  const handleFetchLots = async (fid: string = farmerId) => {
    if (!fid.trim()) return;
    setLoadingLots(true);
    try {
      const res = await getFarmerLots(fid.trim());
      setFarmerLots(res.lots || []);
    } catch (e) {
      setFarmerLots([]);
    } finally {
      setLoadingLots(false);
    }
  };

  const selectedDrug = selectedDrugIndex !== null ? availableDrugs[selectedDrugIndex] : null;

  const handleSubmit = async () => {
    if (!selectedDrug) { setError('Sélectionnez un médicament de votre pharmacie'); return; }
    if (!farmerId.trim()) { setError('Entrez l\'ID de l\'éleveur'); return; }
    if (!lotId.trim()) { setError('Entrez l\'ID du lot'); return; }
    if (!withdrawalDays.trim()) { setError('Entrez le délai de retrait'); return; }
    
    setError(''); setLoading(true);
    try {
      await createPrescription({
        saleId: selectedDrug.sale_id, 
        farmerId: farmerId.trim(), 
        animalLotId: lotId.trim(),
        diagnosis: diagnosis.trim(), 
        dosage: Number(dosage) || 1, 
        withdrawalDays: Number(withdrawalDays),
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
        <Text style={styles.headerTitle}>Nouvelle Prescription</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* AI Card hint */}
        <View style={styles.aiHint}>
          <Bot size={24} color={Colors.primary} />
          <Text style={styles.aiHintText}>Utilisez l'assistant IA pour des recommandations de traitement personnalisées</Text>
        </View>

        {/* Drug selector */}
        <Text style={styles.label}>Médicament (Votre Stock)</Text>
        {loadingDrugs ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} />
        ) : availableDrugs.length === 0 ? (
          <View style={styles.emptyStock}>
            <Pill size={24} color={Colors.onSurfaceVariant} />
            <Text style={styles.emptyStockText}>Aucun médicament disponible. Demandez à une pharmacie de vous enregistrer une vente.</Text>
          </View>
        ) : (
          availableDrugs.map((d, i) => (
            <TouchableOpacity 
              key={d.sale_id} 
              style={[styles.drugCard, selectedDrugIndex === i && styles.drugCardActive]} 
              onPress={() => setSelectedDrugIndex(i)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.drugName, selectedDrugIndex === i && styles.drugNameActive]}>ATC: {d.atc_code}</Text>
                <Text style={styles.drugAtc}>Lot: {d.batch_number} · Qté: {d.quantity}</Text>
              </View>
              <View style={[styles.awareBadge, { backgroundColor: (awareColors as any)[d.aware_class] + '1A' }]}>
                <Text style={[styles.awareText, { color: (awareColors as any)[d.aware_class] }]}>{d.aware_class}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Farmer ID */}
        <Text style={styles.label}>Éleveur</Text>
        <View style={styles.farmerIdRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder="ID de l'éleveur" 
            placeholderTextColor={Colors.onSurfaceVariant} 
            value={farmerId} 
            onChangeText={setFarmerId} 
          />
          <TouchableOpacity 
            style={styles.loadLotsBtn} 
            onPress={() => handleFetchLots(farmerId)}
            disabled={loadingLots || !farmerId.trim()}
            activeOpacity={0.8}
          >
            {loadingLots ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : <Search size={20} color={Colors.onPrimary} />}
          </TouchableOpacity>
        </View>

        {/* Lot ID */}
        <Text style={styles.label}>Identifiant du lot</Text>
        {farmerLots.length > 0 ? (
          <View style={styles.lotsContainer}>
            {farmerLots.map((l: any) => (
              <TouchableOpacity 
                key={l.id} 
                style={[styles.lotCard, lotId === l.id && styles.lotCardActive]}
                onPress={() => setLotId(l.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.lotCardName, lotId === l.id && styles.lotCardNameActive]}>{l.name} ({l.id})</Text>
                {l.species && <Text style={styles.lotCardSpecies}>{l.species} - Qté: {l.quantity}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TextInput 
            style={styles.input} 
            placeholder="Ex: LOT-1234 (Ou cherchez l'éleveur)" 
            placeholderTextColor={Colors.onSurfaceVariant} 
            value={lotId} 
            onChangeText={setLotId} 
          />
        )}

        {/* Diagnosis */}
        <Text style={styles.label}>Diagnostic</Text>
        <TextInput 
          style={[styles.input, styles.textarea]} 
          placeholder="Décrivez les symptômes et le diagnostic..." 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={diagnosis} 
          onChangeText={setDiagnosis} 
          multiline 
          numberOfLines={3} 
          textAlignVertical="top" 
        />

        {/* Dosage */}
        <Text style={styles.label}>Posologie (mg/kg)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 15" 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={dosage} 
          onChangeText={setDosage} 
          keyboardType="numeric" 
        />

        {/* Withdrawal */}
        <Text style={styles.label}>Jours de retrait</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Jours recommandés par l'IA ou les guidelines" 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={withdrawalDays} 
          onChangeText={setWithdrawalDays} 
          keyboardType="numeric" 
        />

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
              <Text style={styles.submitText}>Confirmer la Prescription</Text>
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
  aiHint: { 
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, 
    backgroundColor: Colors.primary + '1A', 
    borderRadius: Radii.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '33',
    marginBottom: Spacing.md
  },
  aiHintText: { fontSize: 13, color: Colors.primary, fontWeight: '600', flex: 1, lineHeight: 18 },
  emptyStock: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.outline,
  },
  emptyStockText: { fontSize: 13, color: Colors.onSurfaceVariant, flex: 1, lineHeight: 20 },
  drugCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.md, 
    marginBottom: Spacing.sm, 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  drugCardActive: { 
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '0A',
    ...Shadows.md
  },
  drugName: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  drugNameActive: { color: Colors.primary, fontWeight: '700' },
  drugAtc: { fontSize: 12, fontFamily: Fonts?.mono, color: Colors.onSurfaceVariant, marginTop: 4 },
  awareBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full },
  awareText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  input: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.md, paddingVertical: 14, 
    fontSize: 15, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.outline,
  },
  farmerIdRow: { flexDirection: 'row', gap: Spacing.sm },
  loadLotsBtn: { 
    backgroundColor: Colors.primary, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.lg, 
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm
  },
  lotsContainer: { gap: Spacing.sm },
  lotCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.md, 
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  lotCardActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.primary + '0A' 
  },
  lotCardName: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  lotCardNameActive: { color: Colors.primary },
  lotCardSpecies: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  textarea: { minHeight: 100, paddingTop: 14 },
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
