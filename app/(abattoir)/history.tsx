/**
 * Abattoir — Scan History Screen (dynamic from API)
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getLotCertifications } from '@/services/api';
import { Home, ScanLine, History, User } from 'lucide-react-native';


type Certification = {
  lot_id: string;
  certificate_hash: string;
  eligible: number;
  tx_hash: string;
  certified_at: string;
  total_treatments: number;
  distinct_farmers: number;
};

export default function HistoryScreen() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLotCertifications()
      .then((r) => setCertifications(r.certifications))
      .catch(() => setCertifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Historique des Scans</Text>
        <Text style={s.subtitle}>{certifications.length} certifications</Text>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
        ) : certifications.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 30 }}>Aucun historique</Text>
        ) : certifications.map((cert, i) => {
          const result = cert.eligible === 1 ? 'eligible' : 'rejected';
          const certDate = new Date(cert.certified_at);
          const dateStr = certDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          const timeStr = certDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          return (
            <View key={cert.lot_id || i} style={s.card}>
              <View style={[s.dot, { backgroundColor: result === 'eligible' ? Colors.status.certified : Colors.status.rejected }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.lot}>Lot {cert.lot_id}</Text>
                <Text style={s.farm}>{cert.total_treatments} traitement(s) · {cert.distinct_farmers} éleveur(s)</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={[s.resultBadge, { backgroundColor: result === 'eligible' ? '#E8F5E9' : '#FFEBEE' }]}>
                  <Text style={[s.resultText, { color: result === 'eligible' ? Colors.status.certified : Colors.status.rejected }]}>
                    {result === 'eligible' ? ' Éligible' : ' Rejeté'}
                  </Text>
                </View>
                <Text style={s.time}>{dateStr} · {timeStr}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/scanner')}><ScanLine size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><History size={24} color={Colors.primary} /><Text style={s.tabLabelActive}>Historique</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/profile')}><User size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, ...Shadows.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lot: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  farm: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  resultText: { fontSize: 11, fontWeight: '700' },
  time: { fontSize: 10, color: Colors.outline, marginTop: 4 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
