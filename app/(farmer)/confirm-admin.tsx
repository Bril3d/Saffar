/**
 * Farmer — Confirm Administration Screen
 * Offline-capable, confirms that prescribed drug was administered to the lot.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getFarmerPrescriptions, confirmPrescription } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { PrescriptionResponse } from '@/services/types';
import { ArrowLeft, CheckCircle2, AlertTriangle, Syringe } from 'lucide-react-native';

export default function ConfirmAdminScreen() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      getFarmerPrescriptions(user.id)
        .then(rxs => setPrescriptions(rxs.filter(r => !r.administered)))
        .catch(() => setPrescriptions([]))
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [user?.id]);

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true); setError(''); Keyboard.dismiss();
    try {
      await confirmPrescription(selected);
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmer Traitement</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Sélectionnez la prescription</Text>
        
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} /> :
          prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Syringe size={48} color={Colors.outlineVariant} />
              <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: Spacing.md }}>Aucune prescription en attente</Text>
            </View>
          ) :
          prescriptions.map((p) => (
            <TouchableOpacity 
              key={p.rx_id} 
              style={[styles.rxCard, selected === p.rx_id && styles.rxCardActive]} 
              activeOpacity={0.8}
              onPress={() => setSelected(p.rx_id)}
            >
              <View style={styles.rxLeft}>
                <View style={[styles.radio, selected === p.rx_id && styles.radioActive]}>
                  {selected === p.rx_id && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rxId}>Rx {p.rx_id?.slice(0, 8)}</Text>
                  <Text style={styles.rxDrug}>{p.diagnosis || 'Traitement'}</Text>
                  <View style={styles.rxMetaContainer}>
                    <Text style={styles.rxMeta}>Lot: {p.animal_lot_id}</Text>
                    <Text style={styles.rxMetaDot}>•</Text>
                    <Text style={styles.rxMetaWithdrawal}>{p.withdrawal_days}j de retrait</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        }

        <Text style={styles.label}>Notes d'observation (optionnel)</Text>
        <TextInput 
          style={[styles.input, styles.textarea]} 
          placeholder="Ex: Animal bien réagi au traitement..." 
          placeholderTextColor={Colors.outline} 
          value={notes} 
          onChangeText={setNotes} 
          multiline 
          numberOfLines={3} 
          textAlignVertical="top" 
        />

        <View style={styles.warningBox}>
          <AlertTriangle size={24} color="#F57F17" />
          <Text style={styles.warningText}>
            Cette action déclenchera le délai de retrait officiel sur la blockchain. Assurez-vous que le traitement a bien été administré.
          </Text>
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
          style={[styles.submitBtn, (!selected || submitting) && styles.submitBtnDisabled]} 
          activeOpacity={0.85} 
          onPress={handleConfirm} 
          disabled={!selected || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <>
              <CheckCircle2 size={24} color={Colors.onPrimary} />
              <Text style={styles.submitText}>Certifier & Démarrer Retrait</Text>
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
    marginBottom: Spacing.sm, marginTop: Spacing.md 
  },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },

  rxCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    padding: Spacing.lg, 
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm
  },
  rxCardActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.primary + '0A', // very light primary
    ...Shadows.md
  },
  rxLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  radio: { 
    width: 24, height: 24, borderRadius: 12, 
    borderWidth: 2, borderColor: Colors.outlineVariant, 
    alignItems: 'center', justifyContent: 'center' 
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  
  rxId: { fontSize: 13, fontFamily: Fonts?.mono, fontWeight: '700', color: Colors.onSurfaceVariant },
  rxDrug: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginTop: 4 },
  rxMetaContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rxMeta: { fontSize: 13, color: Colors.onSurfaceVariant },
  rxMetaDot: { marginHorizontal: 6, color: Colors.outline },
  rxMetaWithdrawal: { fontSize: 13, fontWeight: '700', color: Colors.warning },
  
  input: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, 
    paddingHorizontal: Spacing.md, paddingVertical: 14, 
    fontSize: 15, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.outline,
  },
  textarea: { minHeight: 100, paddingTop: 14 },
  
  warningBox: { 
    flexDirection: 'row', gap: Spacing.sm, 
    backgroundColor: '#FFF8E1', 
    borderRadius: Radii.md, padding: Spacing.md, 
    marginTop: Spacing.xl,
    borderWidth: 1, borderColor: '#FFECB3'
  },
  warningText: { fontSize: 13, color: '#F57F17', flex: 1, lineHeight: 20 },
  
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
