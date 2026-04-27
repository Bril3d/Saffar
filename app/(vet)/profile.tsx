import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { Home, ClipboardList, Bot, User } from 'lucide-react-native';

export default function VetProfile() {
  const { user } = useAuth();
  return (
    <ProfileScreen
      role="Vétérinaire" roleIcon="" name={user?.name || 'Vétérinaire'} email={user?.email || ''}
      walletAddress={user?.walletAddress || 'Non connecté'}
      stats={[
        { label: 'Prescriptions', value: '87' },
        { label: 'Ce mois', value: '12' },
        { label: 'Score IA', value: '94%' },
      ]}
      menuItems={[
        { icon: '', label: 'Statistiques prescriptions' },
        { icon: '', label: 'Historique IA' },
        { icon: '', label: 'Préférences de notifications' },
        { icon: '', label: 'Sécurité & Clé privée' },
        { icon: '', label: 'Licence vétérinaire' },
        { icon: '', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/home')}>
            <Home size={24} color={Colors.onSurfaceDisabled} />
            <Text style={s.tabLabel}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/prescriptions')}>
            <ClipboardList size={24} color={Colors.onSurfaceDisabled} />
            <Text style={s.tabLabel}>Rx</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/ai-assistant')}>
            <Bot size={24} color={Colors.onSurfaceDisabled} />
            <Text style={s.tabLabel}>IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tab} activeOpacity={0.7}>
            <User size={24} color={Colors.primary} />
            <Text style={s.tabLabelActive}>Profil</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}
const s = StyleSheet.create({
  tabBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    flexDirection: 'row', 
    backgroundColor: 'rgba(247, 245, 240, 0.9)', 
    borderTopWidth: 1, borderTopColor: Colors.outline,
    paddingTop: 8, paddingBottom: 24, 
    justifyContent: 'center',
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, maxWidth: 100 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceDisabled },
  tabLabelActive: { fontSize: 10, fontWeight: '600', color: Colors.primary },
});
