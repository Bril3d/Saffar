/**
 * Pharmacy — Sale Confirmed Screen
 * Success animation, txHash, on-chain badge.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { CheckCircle2 } from 'lucide-react-native';


export default function SaleConfirmedScreen() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <View style={s.content}>
        {/* Success hero */}
        <View style={s.successCircle}>
          <CheckCircle2 size={32} color={Colors.primary} />
        </View>
        <Text style={s.title}>Vente Enregistrée</Text>
        <Text style={s.subtitle}>La transaction a été confirmée sur la blockchain</Text>

        {/* On-chain badge */}
        <View style={s.onchainBadge}>
          <View style={s.onchainDot} />
          <Text style={s.onchainText}>On-chain </Text>
        </View>

        {/* Transaction details */}
        <View style={s.detailCard}>
          <Text style={s.detailLabel}>Hash de la transaction</Text>
          <Text style={s.txHash}>0x7f3a9b2c4d1e8f0a6b5c3d2e1f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e4b2</Text>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Bloc</Text>
            <Text style={s.detailValue}>#14,892,341</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Réseau</Text>
            <Text style={s.detailValue}>Farm Care (Hardhat)</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Confirmations</Text>
            <Text style={s.detailValue}>3 / 3</Text>
          </View>
        </View>

        {/* Action */}
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/(pharmacy)/home')} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Retour à l'accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => router.replace('/(pharmacy)/new-sale')}>
          <Text style={s.ghostBtnText}>Nouvelle vente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  content: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center' },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, ...Shadows.glow(Colors.primary) },
  successIcon: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg, lineHeight: 20 },
  onchainBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryFixed, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radii.full, marginBottom: Spacing.xl },
  onchainDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  onchainText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  detailCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.xl, padding: Spacing.lg, width: '100%', marginBottom: Spacing.xl },
  detailLabel: { fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  txHash: { fontSize: 11, fontFamily: 'monospace', color: Colors.onSurface, marginBottom: Spacing.md, lineHeight: 18 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  detailValue: { fontSize: 13, fontWeight: '700', color: Colors.onSurface },
  primaryBtn: { backgroundColor: Colors.primaryContainer, borderRadius: Radii.full, paddingVertical: 18, width: '100%', alignItems: 'center', ...Shadows.glow(Colors.primaryContainer) },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary },
  ghostBtn: { marginTop: Spacing.md, paddingVertical: 14 },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
