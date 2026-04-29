import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { getLotCertifications } from '@/services/api';
import { Home, ScanLine, History, User } from 'lucide-react-native';

export default function AbattoirProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Scans', value: '...' },
    { label: 'Éligibles', value: '...' },
    { label: 'Rejetés', value: '...' },
  ]);

  useEffect(() => {
    getLotCertifications().then(r => {
      const certs = r.certifications || [];
      setStats([
        { label: 'Scans', value: String(certs.length) },
        { label: 'Éligibles', value: String(certs.filter(c => c.eligible === 1).length) },
        { label: 'Rejetés', value: String(certs.filter(c => c.eligible === 0).length) },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <ProfileScreen
      role="Abattoir" roleIcon="" name={user?.name || 'Abattoir'} email={user?.email || ''}
      walletAddress={user?.walletAddress || 'Non connecté'}
      stats={stats}
      menuItems={[
        { icon: '', label: 'Rapports quotidiens' },
        { icon: '', label: 'Calibration scanner' },
        { icon: '', label: 'Préférences de notifications' },
        { icon: '', label: 'Sécurité & Clé privée' },
        { icon: '', label: 'Certifications sanitaires' },
        { icon: '', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/scanner')}><ScanLine size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Scanner</Text></TouchableOpacity>
          <TouchableOpacity style={s.tab} onPress={() => router.replace('/(abattoir)/history')}><History size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Historique</Text></TouchableOpacity>
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
