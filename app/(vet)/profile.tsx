import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';

export default function VetProfile() {
  return (
    <ProfileScreen
      role="Vétérinaire" roleIcon="🩺" name="Dr. Sami Ben Ali" email="sami@vet-tunis.tn"
      walletAddress="0x8b2c…5678"
      stats={[
        { label: 'Prescriptions', value: '87' },
        { label: 'Ce mois', value: '12' },
        { label: 'Score IA', value: '94%' },
      ]}
      menuItems={[
        { icon: '📊', label: 'Statistiques prescriptions' },
        { icon: '🤖', label: 'Historique IA' },
        { icon: '🔔', label: 'Préférences de notifications' },
        { icon: '🔒', label: 'Sécurité & Clé privée' },
        { icon: '📄', label: 'Licence vétérinaire' },
        { icon: '❓', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/prescriptions')}><Text style={s.tabIcon}>📋</Text><Text style={s.tabLabel}>Rx</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/ai-assistant')}><Text style={s.tabIcon}>🤖</Text><Text style={s.tabLabel}>IA</Text></TouchableOpacity>
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
