/**
 * Consumer — Traceability Screen
 * Full on-chain traceability timeline for a product.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { getTraceability, explainTrace } from '@/services/api';
import type { TraceResponse } from '@/services/types';
import { ArrowLeft, ShieldCheck, Box, Syringe, Clock, CheckCircle2, Bot } from 'lucide-react-native';

const productImages = {
  eggs: require('@/assets/images/eggs.png'),
  honey: require('@/assets/images/honey.png'),
  beef: require('@/assets/images/beef.png'),
  sheep: require('@/assets/images/sheep.png'),
  cattle: require('@/assets/images/cattle.png'),
};

function getImageForSpecies(species: string) {
  const t = (species || '').toLowerCase();
  if (t.includes('oeuf') || t.includes('poulet') || t.includes('chicken') || t.includes('egg')) return productImages.eggs;
  if (t.includes('miel') || t.includes('honey')) return productImages.honey;
  if (t.includes('mouton') || t.includes('ovin') || t.includes('sheep') || t.includes('agneau')) return productImages.sheep;
  if (t.includes('bovin') || t.includes('boeuf') || t.includes('beef') || t.includes('viande')) return productImages.beef;
  return productImages.cattle;
}

export default function TraceabilityScreen() {
  const params = useLocalSearchParams<{ lotId: string }>();
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (params.lotId) {
      getTraceability(params.lotId).then(setTrace).catch(() => setTrace(null)).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [params.lotId]);

  const traceSteps = trace ? [
    ...(trace.lotCreation ? [{ 
      icon: <Box size={20} color={Colors.primary} />, 
      label: 'Création du lot', 
      detail: `${trace.lotCreation.name} (${trace.lotCreation.species || 'Bovin'}) - ${trace.lotCreation.quantity || 1} tête(s)`, 
      date: new Date(trace.lotCreation.createdAt).toLocaleDateString('fr-FR') 
    }] : []),
    ...trace.prescriptions.flatMap((rx) => {
        const events = [];
        events.push({
          icon: <Syringe size={20} color={rx.administered ? Colors.success : Colors.warning} />,
          label: rx.administered ? 'Traitement administré' : 'Prescription vétérinaire',
          detail: `${rx.antibiotic} · ${rx.awareClass}`,
          date: rx.treatmentStart ? new Date(rx.treatmentStart).toLocaleDateString('fr-FR') : '',
        });
        if (rx.withdrawalEnd) {
          events.push({
            icon: <Clock size={20} color={Colors.warning} />,
            label: 'Fin délai d\'attente',
            detail: 'Abattage autorisé après cette date',
            date: new Date(rx.withdrawalEnd).toLocaleDateString('fr-FR'),
          });
        }
        return events;
    }),
    ...(trace.certification?.certified ? [{ 
      icon: <CheckCircle2 size={20} color={Colors.success} />, 
      label: 'Certifié et validé', 
      detail: `Score de confiance: ${trace.trustScore}%`, 
      date: trace.certification.certifiedAt ? new Date(trace.certification.certifiedAt).toLocaleDateString('fr-FR') : '' 
    }] : []),
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Traçabilité Blockchain</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} /> :
          !trace ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 40 }}>Aucune donnée de traçabilité</Text> : <>
            
            {/* Banner */}
            <View style={styles.productBanner}>
              <View style={styles.imageBox}>
                <Image source={getImageForSpecies(trace.lotCreation?.species || '')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>Lot #{trace.lotId}</Text>
                <Text style={styles.productLot}>{trace.prescriptions.length} traitement(s) enregistré(s)</Text>
              </View>
              <View style={styles.trustCircle}>
                <Text style={styles.trustText}>{trace.trustScore}</Text>
              </View>
            </View>

            <View style={styles.chainBadge}>
              <ShieldCheck size={16} color={Colors.primary} />
              <Text style={styles.chainText}>{trace.verifiedOnBlockchain ? 'Vérifié on-chain' : 'Non vérifié'}</Text>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Audit Vet-Éleveur</Text>
              <View style={styles.row}>
                <Text style={styles.infoLbl}>Vétérinaires impliqués:</Text>
                <Text style={styles.infoVal}>{trace.farmerVetTraceability?.distinctVeterinarians ?? 0}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.infoLbl}>Éleveurs impliqués:</Text>
                <Text style={styles.infoVal}>{trace.farmerVetTraceability?.distinctFarmers ?? 0}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.infoLbl}>Retrait de médicaments:</Text>
                <Text style={[styles.infoVal, { color: trace.lotDetails?.inWithdrawal ? Colors.warning : Colors.success }]}>
                  {trace.lotDetails?.inWithdrawal ? 'En cours (Non abattable)' : 'Délai respecté'}
                </Text>
              </View>
              {!!trace.certification?.txHash && (
                <View style={[styles.row, { marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.outline, paddingTop: Spacing.sm }]}>
                  <Text style={styles.infoLbl}>Hash de transaction:</Text>
                  <Text style={styles.infoHash} numberOfLines={1} ellipsizeMode="middle">{trace.certification.txHash}</Text>
                </View>
              )}
            </View>

            <Text style={styles.timelineHeader}>Historique du lot</Text>

            {/* Timeline */}
            <View style={styles.timelineContainer}>
              {traceSteps.map((step, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={styles.timelineDot}>
                      {step.icon}
                    </View>
                    {i < traceSteps.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.stepLabel}>{step.label}</Text>
                    <Text style={styles.stepDetail}>{step.detail}</Text>
                    <Text style={styles.stepDate}>{step.date}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* AI Explainer */}
            <TouchableOpacity 
              style={styles.aiBtn}
              activeOpacity={0.85}
              disabled={aiLoading}
              onPress={async () => {
                if (aiExplanation) { setAiExplanation(null); return; }
                setAiLoading(true);
                try {
                  const res = await explainTrace(params.lotId!);
                  setAiExplanation(res.explanation);
                } catch {
                  setAiExplanation('Service IA indisponible pour le moment.');
                } finally { setAiLoading(false); }
              }}
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Bot size={20} color={Colors.primary} />
              )}
              <Text style={styles.aiBtnText}>
                {aiExplanation ? 'Masquer l\'explication IA' : 'Expliquer par IA'}
              </Text>
            </TouchableOpacity>

            {aiExplanation && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Bot size={20} color={Colors.primary} />
                  <Text style={styles.aiCardTitle}>Explication IA</Text>
                </View>
                <Text style={styles.aiCardText}>{aiExplanation}</Text>
              </View>
            )}
          </>
        }
      </ScrollView>
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
  
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 60 },
  
  productBanner: { 
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.xl, padding: Spacing.sm, 
    marginBottom: Spacing.md, 
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  imageBox: { width: 64, height: 64, borderRadius: Radii.md, backgroundColor: Colors.surfaceContainerLow, overflow: 'hidden' },
  productName: { fontSize: 17, fontWeight: '800', color: Colors.onSurface },
  productLot: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  trustCircle: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.xs,
    ...Shadows.sm
  },
  trustText: { fontSize: 17, fontWeight: '900', color: '#fff' },
  
  chainBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: Colors.primary + '1A', 
    paddingHorizontal: 14, paddingVertical: 8, 
    borderRadius: Radii.full, alignSelf: 'flex-start', 
    marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  chainText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  
  infoCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.lg, 
    marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  infoTitle: { fontSize: 16, fontWeight: '800', color: Colors.onSurface, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLbl: { fontSize: 13, color: Colors.onSurfaceVariant },
  infoVal: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  infoHash: { fontSize: 13, fontFamily: Fonts?.mono, color: Colors.primary, fontWeight: '600', maxWidth: '50%' },
  
  timelineHeader: { fontSize: 18, fontWeight: '800', color: Colors.onSurface, marginBottom: Spacing.lg, marginLeft: Spacing.xs },
  
  timelineContainer: { paddingLeft: Spacing.xs },
  timelineItem: { flexDirection: 'row', minHeight: 90 },
  timelineLeft: { width: 44, alignItems: 'center' },
  timelineDot: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: Colors.primary + '1A', 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '33',
    ...Shadows.sm
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.outline, marginVertical: 4 },
  
  timelineContent: { flex: 1, paddingLeft: Spacing.md, paddingBottom: Spacing.xl, paddingTop: 4 },
  stepLabel: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  stepDetail: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  stepDate: { fontSize: 12, color: Colors.outlineVariant, marginTop: 8, fontWeight: '600' },

  aiBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.full, paddingVertical: 14, marginTop: Spacing.lg,
    borderWidth: 1, borderColor: Colors.primary,
  },
  aiBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  aiCard: {
    backgroundColor: Colors.primary + '0A',
    borderRadius: Radii.lg, padding: Spacing.lg, marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  aiCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  aiCardText: { fontSize: 14, color: Colors.onSurface, lineHeight: 22 },
});
