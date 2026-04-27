/**
 * Consumer — Orders Screen
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { getOrders } from '@/services/api';
import type { OrderResponse } from '@/services/types';
import { Home, ScanLine, FileText, User } from 'lucide-react-native';


const statusMap: Record<string, string> = { PENDING: '⏳ En attente', CONFIRMED: ' Confirmée', PREPARING: ' En préparation', READY: ' En livraison', DELIVERED: ' Livré' };

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(r => setOrders(r.orders || [])).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={st.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}> Mes Commandes</Text>
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} /> :
          orders.length === 0 ? <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 30 }}>Aucune commande</Text> :
          orders.map((o) => (
            <View key={o.id} style={st.card}>
              <View style={{ flex: 1 }}>
                <Text style={st.id}>{o.id?.slice(0, 12)}</Text>
                <Text style={st.items}>{o.product_title} × {o.quantity}</Text>
                <Text style={st.date}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={st.total}>{o.total_price?.toFixed(3)} TND</Text>
                <Text style={st.status}>{statusMap[o.status] || o.status}</Text>
              </View>
            </View>
          ))
        }
      </ScrollView>
      <View style={st.tabBar}>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/scanner')}><ScanLine size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/cart')}><FileText size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Panier</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab}><FileText size={24} color={Colors.onSurfaceVariant} /><Text style={st.tLA}>Commandes</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/profile')}><User size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Profil</Text></TouchableOpacity>
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
