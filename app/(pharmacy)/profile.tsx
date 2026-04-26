import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';

export default function PharmacyProfile() {
  return (
    <ProfileScreen
      role="Pharmacien" roleIcon="💊" name="Ahmed Bouazizi" email="ahmed@pharmacie-centrale.tn"
      walletAddress="0x7f3a…e4b2"
      stats={[
        { label: 'Ventes', value: '142' },
        { label: 'Ce mois', value: '24' },
        { label: 'Score', value: '96%' },
      ]}
      menuItems={[
        { icon: '📊', label: 'Statistiques détaillées' },
        { icon: '💊', label: 'Stock & Inventaire' },
        { icon: '🔔', label: 'Préférences de notifications' },
        { icon: '🔒', label: 'Sécurité & Clé privée' },
        { icon: '📄', label: 'Documents réglementaires' },
        { icon: '❓', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/sales')}><Text style={s.tabIcon}>📋</Text><Text style={s.tabLabel}>Ventes</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(pharmacy)/alerts')}><Text style={s.tabIcon}>🔔</Text><Text style={s.tabLabel}>Alertes</Text></TouchableOpacity>
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
