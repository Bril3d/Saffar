/**
 * SAFAR Chain — Abattoir Home Screen
 * Today's stats, hero scanner CTA, recent certifications from API.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getLotCertifications, getPendingAbattoirLots, getEligibility } from '@/services/api';
import { useAuth } from '@/store/authStore';
import { Home, ScanLine, History, User, Factory, Bell, QrCode, ArrowRight, Package } from 'lucide-react-native';

type Certification = {
  lot_id: string;
  certificate_hash: string;
  eligible: number;
  tx_hash: string;
  certified_at: string;
  total_treatments: number;
  distinct_farmers: number;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export default function AbattoirHomeScreen() {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [pendingLots, setPendingLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingLotId, setCheckingLotId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getLotCertifications().then((r) => setCertifications(r.certifications)).catch(() => setCertifications([])),
      getPendingAbattoirLots().then((r) => setPendingLots(r.pendingLots)).catch(() => setPendingLots([]))
    ]).finally(() => setLoading(false));
  }, []);

  const handleCheckPendingLot = async (lotId: string, rxId: string) => {
    if (checkingLotId) return;
    setCheckingLotId(lotId);
    try {
      const res = await getEligibility(lotId, rxId);
      if (res.eligible) {
        router.push({ pathname: '/(abattoir)/result-eligible', params: { lotId: res.lotId, rxId, daysRemaining: String(res.daysRemaining) } } as any);
      } else {
        router.push({ pathname: '/(abattoir)/result-rejected', params: { lotId: res.lotId, daysRemaining: String(res.daysRemaining) } } as any);
      }
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Erreur de vérification');
    } finally {
      setCheckingLotId(null);
    }
  };

  const eligible = certifications.filter((c) => c.eligible === 1).length;
  const rejected = certifications.filter((c) => c.eligible === 0).length;
  const stats = [
    { value: String(certifications.length), label: 'Lots vérifiés', color: Colors.onSurfaceVariant },
    { value: String(eligible), label: 'Éligibles', color: Colors.success },
    { value: String(rejected), label: 'Rejetés', color: Colors.error },
  ];
  const recentScans = certifications.slice(0, 5).map((c) => ({
    lot: `Lot ${c.lot_id}`,
    result: c.eligible === 1 ? ('eligible' as const) : ('rejected' as const),
    time: timeAgo(c.certified_at),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.roleChip}>
              <Factory size={16} color={Colors.primary} />
              <Text style={styles.roleChipText}>Abattoir</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Bell size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'A'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>Bonjour, {user?.name || 'Inspecteur'}</Text>

        {/* Stats */}
        <View style={styles.sectionGap}>
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Hero Scanner CTA */}
          <TouchableOpacity 
            style={styles.scannerHero} 
            activeOpacity={0.85} 
            onPress={() => router.push('/(abattoir)/scanner')}
          >
            <View style={styles.scannerHeroContent}>
              <View style={styles.scannerGlow}>
                <QrCode size={32} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scannerTitle}>Scanner un Lot</Text>
                <Text style={styles.scannerSubtitle}>Vérifier l'éligibilité via blockchain</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Pending Requests */}
          {pendingLots.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Demandes d'Abattage</Text>
                <Text style={{ fontSize: 13, color: Colors.warning, fontWeight: '700' }}>{pendingLots.length} en attente</Text>
              </View>
              {pendingLots.map((lot, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.scanCard, checkingLotId === lot.lot_id && { opacity: 0.7 }]} 
                  activeOpacity={0.8}
                  onPress={() => handleCheckPendingLot(lot.lot_id, lot.latest_rx_id)}
                  disabled={!!checkingLotId}
                >
                  <View style={styles.scanLeft}>
                    <View style={styles.pendingIconBox}>
                      <Package size={20} color={Colors.warning} />
                    </View>
                    <View>
                      <Text style={styles.scanLot}>{lot.name} ({lot.species || 'Bovin'})</Text>
                      <Text style={styles.scanTime}>Éleveur: {lot.farmer_name}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    {checkingLotId === lot.lot_id ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <ArrowRight size={20} color={Colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recent Scans */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scans Récents</Text>
            <TouchableOpacity onPress={() => router.push('/(abattoir)/history')} activeOpacity={0.7}>
              <Text style={styles.seeAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : recentScans.length === 0 ? (
            <View style={styles.emptyState}>
              <ScanLine size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyStateText}>Aucun scan récent</Text>
            </View>
          ) : recentScans.map((scan, i) => (
            <TouchableOpacity key={i} style={styles.scanCard} activeOpacity={0.8}>
              <View style={styles.scanLeft}>
                <View style={[styles.scanDot, { backgroundColor: scan.result === 'eligible' ? Colors.success : Colors.error }]} />
                <View>
                  <Text style={styles.scanLot}>{scan.lot}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={[styles.resultBadge, {
                  backgroundColor: scan.result === 'eligible' ? Colors.success + '1A' : Colors.error + '1A', // 10% opacity
                }]}>
                  <Text style={[styles.resultText, {
                    color: scan.result === 'eligible' ? Colors.success : Colors.error,
                  }]}>
                    {scan.result === 'eligible' ? 'Éligible' : 'Rejeté'}
                  </Text>
                </View>
                <Text style={styles.scanTime}>{scan.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <Home size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(abattoir)/scanner')}>
          <ScanLine size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(abattoir)/history')}>
          <History size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(abattoir)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  roleChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary + '1A', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 6, 
    borderRadius: Radii.full,
    gap: Spacing.xs,
  },
  roleChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: { 
    width: 40, height: 40, borderRadius: Radii.full, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  avatar: { 
    width: 40, height: 40, borderRadius: Radii.full, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center' 
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimary },

  pageTitle: { fontSize: 28, fontWeight: '700', color: Colors.onSurface, letterSpacing: -0.5, marginBottom: Spacing.xl },

  sectionGap: { gap: Spacing.lg },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  statCard: { 
    flex: 1, 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.md, 
    padding: Spacing.md, 
    borderWidth: 1, 
    borderColor: Colors.outline,
    ...Shadows.sm 
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' },

  // Scanner hero
  scannerHero: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '33', // 20% opacity primary border
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadows.md,
  },
  scannerHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scannerGlow: {
    width: 56, height: 56, borderRadius: Radii.md,
    backgroundColor: Colors.primary + '1A', // 10% opacity
    alignItems: 'center', justifyContent: 'center',
  },
  scannerTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginBottom: 2 },
  scannerSubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 18 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  seeAllLink: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  emptyStateText: { color: Colors.onSurfaceVariant, fontSize: 14 },

  scanCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
  },
  scanLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  scanDot: { width: 10, height: 10, borderRadius: 5 },
  scanLot: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  resultBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full },
  resultText: { fontSize: 12, fontWeight: '700' },
  scanTime: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 6 },
  pendingIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.warning + '1A', alignItems: 'center', justifyContent: 'center' },

  tabBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    flexDirection: 'row', 
    backgroundColor: 'rgba(247, 245, 240, 0.9)', 
    borderTopWidth: 1, borderTopColor: Colors.outline,
    paddingTop: 8, paddingBottom: 24, 
    justifyContent: 'center',
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, maxWidth: 100 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceDisabled },
  tabLabelActive: { fontSize: 10, fontWeight: '600', color: Colors.primary },
});
