import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Keyboard, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { createLot } from '@/services/api';
import { useAuth } from '@/store/authStore';
import { Plus, ArrowLeft, CheckCircle2, AlertTriangle, Minus } from 'lucide-react-native';

const speciesOptions = [
  { label: 'Bovins', value: 'Bovin', image: require('@/assets/images/cattle.png') },
  { label: 'Ovins', value: 'Ovin', image: require('@/assets/images/sheep.png') },
  { label: 'Poulets', value: 'Poulet', image: require('@/assets/images/eggs.png') },
  { label: 'Abeilles', value: 'Abeille', image: require('@/assets/images/honey.png') },
];

export default function AddLotScreen() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Entrez le nom du lot'); return; }

    setError(''); setLoading(true); Keyboard.dismiss();
    try {
      await createLot({
        name: name.trim(),
        species: speciesOptions[selectedSpecies].value,
        quantity,
      });
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur lors de la création du lot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Lot</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Preview Image */}
        <View style={styles.previewBox}>
          <Image 
            source={speciesOptions[selectedSpecies].image} 
            style={{ width: '100%', height: '100%' }} 
            resizeMode="cover" 
          />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewLabel}>{speciesOptions[selectedSpecies].label}</Text>
          </View>
        </View>

        <Text style={styles.label}>Nom du lot</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Poussins Lot A" 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={name} 
          onChangeText={setName} 
        />

        <Text style={styles.label}>Espèce</Text>
        <View style={styles.speciesGrid}>
          {speciesOptions.map((sp, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.speciesCard, selectedSpecies === i && styles.speciesCardActive]} 
              onPress={() => setSelectedSpecies(i)}
              activeOpacity={0.8}
            >
              <Image source={sp.image} style={styles.speciesImage} resizeMode="cover" />
              <Text style={[styles.speciesLabel, selectedSpecies === i && styles.speciesLabelActive]}>{sp.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quantité (têtes)</Text>
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
              <Text style={styles.submitText}>Créer le lot</Text>
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
  
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 120 },
  
  previewBox: { 
    height: 160, borderRadius: Radii.xl, overflow: 'hidden', 
    backgroundColor: Colors.surfaceContainerLow,
    marginBottom: Spacing.lg,
    ...Shadows.md
  },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 10, paddingHorizontal: Spacing.lg,
  },
  previewLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  
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
  
  speciesGrid: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  speciesCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
    marginBottom: Spacing.sm,
  },
  speciesCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  speciesImage: { width: '100%', height: 80 },
  speciesLabel: { 
    fontSize: 14, fontWeight: '600', color: Colors.onSurface, 
    textAlign: 'center', paddingVertical: Spacing.sm 
  },
  speciesLabelActive: { color: Colors.primary, fontWeight: '700' },
  
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.xs },
  qtyBtn: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  qtyValue: { fontSize: 28, fontWeight: '800', color: Colors.onSurface, minWidth: 50, textAlign: 'center' },
  
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
