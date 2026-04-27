import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { getOrders } from '@/services/api';
import { Home, ScanLine, FileText, User } from 'lucide-react-native';

export default function ConsumerProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Commandes', value: '...' },
    { label: 'Livrées', value: '...' },
    { label: 'En cours', value: '...' },
  ]);

  useEffect(() => {
    getOrders().then(r => {
      const orders = r.orders || [];
      setStats([
        { label: 'Commandes', value: String(orders.length) },
        { label: 'Livrées', value: String(orders.filter((o: any) => o.status === 'DELIVERED').length) },
        { label: 'En cours', value: String(orders.filter((o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length) },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <ProfileScreen
      role="Consommateur" roleIcon="" name={user?.name || 'Consommateur'} email={user?.email || ''}
      walletAddress={user?.walletAddress || 'Non connecté'}
      stats={stats}
      menuItems={[
        { icon: '', label: 'Mes commandes', onPress: () => router.push('/(consumer)/orders') },
        { icon: '', label: 'Adresses de livraison' },
        { icon: '', label: 'Moyens de paiement' },
        { icon: '', label: 'Préférences de notifications' },
        { icon: '', label: 'Mes avis' },
        { icon: '', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/scanner')}><ScanLine size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Scanner</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/cart')}><FileText size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Panier</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/orders')}><FileText size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Commandes</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab}><User size={24} color={Colors.primary} /><Text style={s.tabLabelActive}>Profil</Text></TouchableOpacity>
        </View>
      }
    />
  );
}
const s = StyleSheet.create({
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 9, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 9, fontWeight: '700', color: Colors.primary },
});
