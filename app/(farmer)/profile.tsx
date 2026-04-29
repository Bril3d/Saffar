import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ProfileScreen from '@/components/ProfileScreen';
import { Colors, Radii } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { Bot } from 'lucide-react-native';
import { Home, Package, ShoppingCart, User } from 'lucide-react-native';

export default function FarmerProfile() {
  const { user } = useAuth();
  return (
    <ProfileScreen
      role="Éleveur" roleIcon="" name={user?.name || 'Éleveur'} email={user?.email || ''}
      walletAddress={user?.walletAddress || 'Non connecté'}
      stats={[
        { label: 'Lots', value: '8' },
        { label: 'Certifiés', value: '3' },
        { label: 'Ventes', value: '15' },
      ]}
      menuItems={[
        { icon: '', label: 'Statistiques exploitation' },
        { icon: '', label: 'Actions hors ligne en attente' },
        { icon: '', label: 'Préférences de notifications' },
        { icon: '', label: 'Sécurité & Clé privée' },
        { icon: '', label: 'Documents d\'exploitation' },
        { icon: '', label: 'Aide & Support' },
      ]}
      tabBar={
        <View style={s.tabBar}>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/home')}>
            <Home size={24} color={Colors.onSurfaceDisabled} />
            <Text style={s.tabLabel}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/lots')}>
            <Package size={24} color={Colors.onSurfaceDisabled} />
            <Text style={s.tabLabel}>Mes Lots</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/farmer-sales')}>
            <ShoppingCart size={24} color={Colors.onSurfaceDisabled} />
            <Text style={s.tabLabel}>Ventes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tab} activeOpacity={0.7} onPress={() => router.replace('/(farmer)/ai-assistant')}>
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
