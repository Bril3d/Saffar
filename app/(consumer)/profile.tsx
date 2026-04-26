import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';

export default function ConsumerProfile() {
  const { user } = useAuth();
  return (
    <ProfileScreen
      role="Consommateur" roleIcon="🛒" name={user?.name || 'Consommateur'} email={user?.email || ''}
      walletAddress={user?.walletAddress || 'Non connecté'}
      stats={[
        { label: 'Commandes', value: '12' },
        { label: 'Produits scannés', value: '34' },
        { label: 'Avis', value: '8' },
      ]}
      menuItems={[
        { icon: '📦', label: 'Mes commandes', onPress: () => router.push('/(consumer)/orders') },
        { icon: '📍', label: 'Adresses de livraison' },
        { icon: '💳', label: 'Moyens de paiement' },
        { icon: '🔔', label: 'Préférences de notifications' },
        { icon: '⭐', label: 'Mes avis' },
        { icon: '❓', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/scanner')}><Text style={s.tabIcon}>📷</Text><Text style={s.tabLabel}>Scanner</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/cart')}><Text style={s.tabIcon}>🛒</Text><Text style={s.tabLabel}>Panier</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(consumer)/orders')}><Text style={s.tabIcon}>📦</Text><Text style={s.tabLabel}>Commandes</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>👤</Text><Text style={s.tabLabelActive}>Profil</Text></TouchableOpacity>
        </View>
      }
    />
  );
}
const s = StyleSheet.create({
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 20, opacity: 0.5 }, tabIconActive: { fontSize: 20 },
  tabLabel: { fontSize: 9, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 9, fontWeight: '700', color: Colors.primary },
});
