/**
 * Farmer — Confirm Administration Screen
 * Offline-capable, confirms that prescribed drug was administered to the lot.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const prescriptions = [
  { id: 'P-1234', drug: 'Amoxicilline 500mg', lot: 'Poulets de chair', vet: 'Dr. Ben Ali' },
  { id: 'P-1235', drug: 'Enrofloxacine 100mg', lot: 'Bovins', vet: 'Dr. Trabelsi' },
];

export default function ConfirmAdminScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isOffline] = useState(true);

  const handleConfirm = () => {
    router.back();
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />

      {/* Offline indicator */}
      {isOffline && (
        <View style={s.offlineBar}>
          <Text style={s.offlineText}>📶 Mode hors connexion · Action sera synchronisée</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Confirmer Administration</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={s.label}>Prescriptions à confirmer</Text>
        {prescriptions.map((p) => (
          <TouchableOpacity key={p.id} style={[s.rxCard, selected === p.id && s.rxCardActive]} onPress={() => setSelected(p.id)}>
            <View style={s.rxLeft}>
              <View style={[s.radio, selected === p.id && s.radioActive]}>
                {selected === p.id && <View style={s.radioInner} />}
              </View>
              <View>
                <Text style={s.rxId}>{p.id}</Text>
                <Text style={s.rxDrug}>{p.drug}</Text>
                <Text style={s.rxMeta}>{p.lot} · {p.vet}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={s.label}>Notes (optionnel)</Text>
        <TextInput style={[s.input, s.textarea]} placeholder="Observations sur l'administration..." placeholderTextColor={Colors.outline} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />

        <View style={s.warningBox}>
          <Text style={s.warningIcon}>⚠️</Text>
          <Text style={s.warningText}>Cette action déclenchera le délai de retrait. Assurez-vous que le traitement est terminé.</Text>
        </View>

        <TouchableOpacity style={s.submitBtn} activeOpacity={0.85} onPress={handleConfirm} disabled={!selected}>
          <Text style={s.submitIcon}>{isOffline ? '📶' : '🔐'}</Text>
          <Text style={s.submitText}>{isOffline ? 'Confirmer (hors ligne)' : 'Confirmer'}</Text>
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
