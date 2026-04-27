/**
 * Shared Profile UI component used by all actor profile screens.
 * Premium design with gradient avatar, blockchain wallet card, and settings menu.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { LogOut, ChevronRight, Wallet, Shield, BarChart3, Bell, FileKey, HelpCircle, FileText, Clock, Sparkles } from 'lucide-react-native';

const menuIcons: Record<string, React.ReactNode> = {
  'Statistiques exploitation': <BarChart3 size={20} color={Colors.primary} />,
  'Statistiques prescriptions': <BarChart3 size={20} color={Colors.primary} />,
  'Actions hors ligne en attente': <Clock size={20} color={Colors.warning} />,
  'Historique IA': <Sparkles size={20} color={Colors.secondary} />,
  'Préférences de notifications': <Bell size={20} color={Colors.onSurfaceVariant} />,
  'Sécurité & Clé privée': <FileKey size={20} color={Colors.error} />,
  'Documents d\'exploitation': <FileText size={20} color={Colors.onSurfaceVariant} />,
  'Licence vétérinaire': <Shield size={20} color={Colors.success} />,
  'Aide & Support': <HelpCircle size={20} color={Colors.onSurfaceVariant} />,
};

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
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.avatarOuter}>
            <View style={s.avatarLarge}>
              <Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>{email}</Text>
          <View style={s.roleBadge}>
            <Shield size={14} color={Colors.primary} />
            <Text style={s.roleText}>{role}</Text>
          </View>
        </View>

        {/* Wallet */}
        <View style={s.walletCard}>
          <View style={s.walletIconBox}>
            <Wallet size={20} color={Colors.primary} />
          </View>
          <View style={s.walletLeft}>
            <Text style={s.walletLabel}>Adresse Blockchain</Text>
            <Text style={s.walletAddr} numberOfLines={1} ellipsizeMode="middle">{walletAddress}</Text>
          </View>
          <View style={s.walletBadge}>
            <View style={s.walletDot} />
            <Text style={s.walletBadgeText}>On-chain</Text>
          </View>
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
            <TouchableOpacity key={i} style={[s.menuItem, i < menuItems.length - 1 && s.menuItemBorder]} onPress={item.onPress} activeOpacity={0.7}>
              <View style={s.menuIconBox}>
                {menuIcons[item.label] || <FileText size={20} color={Colors.onSurfaceVariant} />}
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={Colors.outline} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={20} color={Colors.error} />
          <Text style={s.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={s.version}>SAFAR Chain v1.0.0 · Blockchain Hardhat</Text>
      </ScrollView>
      {tabBar}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 120 },
  
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarOuter: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarLarge: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.onPrimary },
  name: { fontSize: 24, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.5 },
  email: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4 },
  roleBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: Colors.primary + '1A', 
    paddingHorizontal: 14, paddingVertical: 6, 
    borderRadius: Radii.full, marginTop: Spacing.sm,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  roleText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  
  walletCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.md, 
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginBottom: Spacing.lg, 
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  walletIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  walletLeft: { flex: 1 },
  walletLabel: { fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  walletAddr: { fontSize: 13, fontFamily: Fonts?.mono, color: Colors.onSurface, marginTop: 4 },
  walletBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.success + '1A', 
    paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: Radii.full 
  },
  walletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  walletBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { 
    flex: 1, 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.md, 
    alignItems: 'center', 
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  
  menuCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.xl, 
    overflow: 'hidden', 
    marginBottom: Spacing.xl, 
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm 
  },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: Spacing.lg, paddingVertical: 18, 
    gap: Spacing.md 
  },
  menuItemBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.outline,
  },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  
  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.error + '0D', 
    borderRadius: Radii.full, paddingVertical: 18,
    borderWidth: 1, borderColor: Colors.error + '33',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: Colors.error },
  version: { fontSize: 12, color: Colors.outlineVariant, textAlign: 'center', marginTop: Spacing.xl },
});
