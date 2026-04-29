import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { getRecentDrugSales } from '@/services/api';
import { Home, ShoppingCart, Bell, User } from 'lucide-react-native';

export default function PharmacyProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Ventes', value: '...' },
    { label: 'Vétérinaires', value: '...' },
    { label: 'Doses', value: '...' },
  ]);

  useEffect(() => {
    getRecentDrugSales().then(sales => {
      setStats([
        { label: 'Ventes', value: String(sales.length) },
        { label: 'Vétérinaires', value: String(new Set(sales.map(s => s.vet_id)).size) },
        { label: 'Doses', value: String(sales.reduce((a, s) => a + s.quantity, 0)) },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <ProfileScreen
      role="Pharmacien" roleIcon="" name={user?.name || 'Pharmacien'} email={user?.email || ''}
      walletAddress={user?.walletAddress || 'Non connecté'}
      stats={stats}
      menuItems={[
        { icon: '', label: 'Statistiques détaillées' },
        { icon: '', label: 'Stock & Inventaire' },
        { icon: '', label: 'Préférences de notifications' },
        { icon: '', label: 'Sécurité & Clé privée' },
        { icon: '', label: 'Documents réglementaires' },
        { icon: '', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/sales')}><ShoppingCart size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Ventes</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/alerts')}><Bell size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Alertes</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab}><User size={24} color={Colors.primary} /><Text style={s.tabLabelActive}>Profil</Text></TouchableOpacity>
        </View>
      }
    />
  );
}
const s = StyleSheet.create({
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
