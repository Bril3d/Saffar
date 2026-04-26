import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';

export default function AbattoirProfile() {
  return (
    <ProfileScreen
      role="Abattoir" roleIcon="🔪" name="Abattoir Manouba" email="admin@abattoir-manouba.tn"
      walletAddress="0xa1f0…def0"
      stats={[
        { label: 'Scans', value: '248' },
        { label: 'Éligibles', value: '210' },
        { label: 'Rejetés', value: '38' },
      ]}
      menuItems={[
        { icon: '📊', label: 'Rapports quotidiens' },
        { icon: '📷', label: 'Calibration scanner' },
        { icon: '🔔', label: 'Préférences de notifications' },
        { icon: '🔒', label: 'Sécurité & Clé privée' },
        { icon: '📄', label: 'Certifications sanitaires' },
        { icon: '❓', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/scanner')}><Text style={s.tabIcon}>📷</Text><Text style={s.tabLabel}>Scanner</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/history')}><Text style={s.tabIcon}>📋</Text><Text style={s.tabLabel}>Historique</Text></TouchableOpacity>
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
