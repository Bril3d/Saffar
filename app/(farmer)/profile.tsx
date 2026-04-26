import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';

export default function FarmerProfile() {
  return (
    <ProfileScreen
      role="Éleveur" roleIcon="🐄" name="Mohamed Ennouri" email="mohamed@ferme-elbaraka.tn"
      walletAddress="0x9d4e…9abc"
      stats={[
        { label: 'Lots', value: '8' },
        { label: 'Certifiés', value: '3' },
        { label: 'Ventes', value: '15' },
      ]}
      menuItems={[
        { icon: '📊', label: 'Statistiques exploitation' },
        { icon: '📶', label: 'Actions hors ligne en attente' },
        { icon: '🔔', label: 'Préférences de notifications' },
        { icon: '🔒', label: 'Sécurité & Clé privée' },
        { icon: '📄', label: 'Documents d\'exploitation' },
        { icon: '❓', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/lots')}><Text style={s.tabIcon}>🐔</Text><Text style={s.tabLabel}>Mes Lots</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/farmer-sales')}><Text style={s.tabIcon}>🛒</Text><Text style={s.tabLabel}>Ventes</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>👤</Text><Text style={s.tabLabelActive}>Profil</Text></TouchableOpacity>
        </View>
      }
    />
  );
}
const s = StyleSheet.create({
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
