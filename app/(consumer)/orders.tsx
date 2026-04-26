/**
 * Consumer — Orders Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const orders = [
  { id: 'CMD-301', items: 'Poulet Bio × 2', total: '22.000', date: '26 Avr', status: 'En livraison 🚚' },
  { id: 'CMD-300', items: 'Oeufs × 5', total: '24.000', date: '24 Avr', status: 'Livré ✅' },
  { id: 'CMD-299', items: 'Viande Bovine × 1', total: '28.000', date: '20 Avr', status: 'Livré ✅' },
];

export default function OrdersScreen() {
  return (
    <SafeAreaView style={st.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}>📦 Mes Commandes</Text>
        {orders.map((o, i) => (
          <View key={i} style={st.card}>
            <View style={{ flex: 1 }}>
              <Text style={st.id}>{o.id}</Text>
              <Text style={st.items}>{o.items}</Text>
              <Text style={st.date}>{o.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={st.total}>{o.total} TND</Text>
              <Text style={st.status}>{o.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={st.tabBar}>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/home')}><Text style={st.tI}>🏠</Text><Text style={st.tL}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/scanner')}><Text style={st.tI}>📷</Text><Text style={st.tL}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/cart')}><Text style={st.tI}>🛒</Text><Text style={st.tL}>Panier</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab}><Text style={st.tIA}>📦</Text><Text style={st.tLA}>Commandes</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/profile')}><Text style={st.tI}>👤</Text><Text style={st.tL}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const st = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.surface},scroll:{paddingHorizontal:Spacing.lg,paddingTop:Spacing.xl,paddingBottom:100},
  title:{fontSize:22,fontWeight:'800',color:Colors.onSurface,marginBottom:Spacing.lg},
  card:{backgroundColor:Colors.surfaceContainerLowest,borderRadius:Radii.lg,padding:Spacing.md,marginBottom:Spacing.sm,flexDirection:'row',alignItems:'center',...Shadows.sm},
  id:{fontSize:12,fontWeight:'700',color:Colors.onSurfaceVariant},items:{fontSize:15,fontWeight:'700',color:Colors.onSurface,marginTop:2},
  date:{fontSize:12,color:Colors.onSurfaceVariant,marginTop:2},total:{fontSize:15,fontWeight:'800',color:Colors.primary},
  status:{fontSize:11,fontWeight:'600',color:Colors.onSurfaceVariant},
  tabBar:{position:'absolute',bottom:0,left:0,right:0,flexDirection:'row',backgroundColor:'rgba(255,255,255,0.95)',paddingVertical:10,paddingBottom:28,justifyContent:'space-around'},
  tab:{alignItems:'center',gap:2},tI:{fontSize:20,opacity:0.5},tIA:{fontSize:20},tL:{fontSize:9,fontWeight:'500',color:Colors.onSurfaceVariant},tLA:{fontSize:9,fontWeight:'700',color:Colors.primary},
});
