/**
 * Shared Profile UI component used by all actor profile screens.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

type MenuItem = { icon: string; label: string; detail?: string; onPress?: () => void };

interface ProfileScreenProps {
  role: string;
  roleIcon: string;
  name: string;
  email: string;
  walletAddress: string;
  stats: { label: string; value: string }[];
  menuItems: MenuItem[];
  tabBar: React.ReactNode;
}

export default function ProfileScreen({
  role, roleIcon, name, email, walletAddress, stats, menuItems, tabBar,
}: ProfileScreenProps) {
  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.avatarLarge}>
            <Text style={s.avatarText}>{name.charAt(0)}</Text>
          </View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>{email}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleIcon}>{roleIcon}</Text>
            <Text style={s.roleText}>{role}</Text>
          </View>
        </View>

        {/* Wallet */}
        <View style={s.walletCard}>
          <View style={s.walletLeft}>
            <Text style={s.walletLabel}>Adresse Blockchain</Text>
            <Text style={s.walletAddr}>{walletAddress}</Text>
          </View>
          <View style={s.walletBadge}><Text style={s.walletBadgeText}>🔗 On-chain</Text></View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {stats.map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={s.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={s.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <Text style={s.menuIcon}>{item.icon}</Text>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={s.version}>SAFAR Chain v1.0.0 · Blockchain Hardhat</Text>
      </ScrollView>
      {tabBar}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 120 },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, ...Shadows.glow(Colors.primaryContainer) },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.onPrimary },
  name: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  email: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryFixed, paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radii.full, marginTop: Spacing.sm },
  roleIcon: { fontSize: 14 },
  roleText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  walletCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, ...Shadows.sm },
  walletLeft: { flex: 1 },
  walletLabel: { fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  walletAddr: { fontSize: 12, fontFamily: 'monospace', color: Colors.onSurface, marginTop: 2 },
  walletBadge: { backgroundColor: Colors.primaryFixed, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  walletBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', ...Shadows.sm },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2, textAlign: 'center' },
  menuCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radii.xl, overflow: 'hidden', marginBottom: Spacing.lg, ...Shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 16, gap: Spacing.sm },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  menuArrow: { fontSize: 20, color: Colors.outline },
  logoutBtn: { backgroundColor: Colors.errorContainer, borderRadius: Radii.full, paddingVertical: 16, alignItems: 'center' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.onErrorContainer },
  version: { fontSize: 11, color: Colors.outline, textAlign: 'center', marginTop: Spacing.lg },
});
