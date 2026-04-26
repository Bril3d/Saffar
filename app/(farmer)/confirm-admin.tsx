/**
 * Farmer — Confirm Administration Screen
 * Offline-capable, confirms that prescribed drug was administered to the lot.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getFarmerPrescriptions, confirmPrescription } from '@/services/api';
import { useAuth } from '@/store/authStore';
import type { PrescriptionResponse } from '@/services/types';

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
    setSubmitting(true); setError('');
    try {
      await confirmPrescription(selected);
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Confirmer Administration</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={s.label}>Prescriptions à confirmer</Text>
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} /> :
          prescriptions.length === 0 ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 20 }}>Aucune prescription en attente</Text> :
          prescriptions.map((p) => (
            <TouchableOpacity key={p.rx_id} style={[s.rxCard, selected === p.rx_id && s.rxCardActive]} onPress={() => setSelected(p.rx_id)}>
              <View style={s.rxLeft}>
                <View style={[s.radio, selected === p.rx_id && s.radioActive]}>
                  {selected === p.rx_id && <View style={s.radioInner} />}
                </View>
                <View>
                  <Text style={s.rxId}>{p.rx_id?.slice(0, 12)}</Text>
                  <Text style={s.rxDrug}>{p.diagnosis}</Text>
                  <Text style={s.rxMeta}>Lot: {p.animal_lot_id} · {p.withdrawal_days}j retrait</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        }

        <Text style={s.label}>Notes (optionnel)</Text>
        <TextInput style={[s.input, s.textarea]} placeholder="Observations..." placeholderTextColor={Colors.outline} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />

        <View style={s.warningBox}>
          <Text style={s.warningIcon}>⚠️</Text>
          <Text style={s.warningText}>Cette action déclenchera le délai de retrait. Assurez-vous que le traitement est terminé.</Text>
        </View>

        {!!error && <Text style={{ color: Colors.onErrorContainer, textAlign: 'center', marginTop: Spacing.sm }}>⚠️ {error}</Text>}

        <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.7 }]} activeOpacity={0.85} onPress={handleConfirm} disabled={!selected || submitting}>
          {submitting ? <ActivityIndicator color={Colors.onPrimary} /> : <><Text style={s.submitIcon}>🔐</Text><Text style={s.submitText}>Confirmer</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  offlineBar: { backgroundColor: Colors.status.withdrawal + '20', paddingVertical: 6, paddingHorizontal: Spacing.md, alignItems: 'center' },
  offlineText: { fontSize: 12, fontWeight: '600', color: Colors.status.withdrawal },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.onSurface },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  rxCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  rxCardActive: { backgroundColor: Colors.primaryFixed },
  rxLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.outline, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  rxId: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant },
  rxDrug: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, marginTop: 2 },
  rxMeta: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  input: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15, color: Colors.onSurface },
  textarea: { minHeight: 80 },
  warningBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#FFF8E1', borderRadius: Radii.lg, padding: Spacing.md, marginTop: Spacing.lg },
  warningIcon: { fontSize: 20 },
  warningText: { fontSize: 13, color: '#F57F17', flex: 1, lineHeight: 18 },
  submitBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, ...Shadows.glow(Colors.primaryContainer) },
  submitIcon: { fontSize: 18 },
  submitText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
});
