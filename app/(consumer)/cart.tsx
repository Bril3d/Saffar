/**
 * Consumer — Cart Screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

const cartItems = [
  { name: 'Poulet Fermier Bio', farm: 'Ferme El Baraka', price: 9.5, qty: 2, trust: 98 },
  { name: 'Oeufs de Campagne', farm: 'Ferme Sidi Bou', price: 4.2, qty: 1, trust: 95 },
];

export default function CartScreen() {
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <SafeAreaView style={st.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}>🛒 Mon Panier</Text>
        {cartItems.map((item, i) => (
          <View key={i} style={st.card}>
            <View style={st.emoji}><Text style={{ fontSize: 28 }}>🥩</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{item.name}</Text>
              <Text style={st.farm}>{item.farm}</Text>
              <Text style={st.price}>{item.price.toFixed(3)} TND × {item.qty}</Text>
            </View>
          </View>
        ))}
        <View style={st.summary}>
          <View style={st.row}><Text style={st.lbl}>Total</Text><Text style={st.val}>{(total+3).toFixed(3)} TND</Text></View>
        </View>
        <TouchableOpacity style={st.btn} activeOpacity={0.85}>
          <Text style={st.btnText}>Commander</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={st.tabBar}>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/home')}><Text style={st.tI}>🏠</Text><Text style={st.tL}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/scanner')}><Text style={st.tI}>📷</Text><Text style={st.tL}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab}><Text style={st.tIA}>🛒</Text><Text style={st.tLA}>Panier</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/orders')}><Text style={st.tI}>📦</Text><Text style={st.tL}>Commandes</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/profile')}><Text style={st.tI}>👤</Text><Text style={st.tL}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const st = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.surface},scroll:{paddingHorizontal:Spacing.lg,paddingTop:Spacing.xl,paddingBottom:100},
  title:{fontSize:22,fontWeight:'800',color:Colors.onSurface,marginBottom:Spacing.lg},
  card:{backgroundColor:Colors.surfaceContainerLowest,borderRadius:Radii.lg,padding:Spacing.md,marginBottom:Spacing.sm,flexDirection:'row',gap:Spacing.md,alignItems:'center',...Shadows.sm},
  emoji:{width:56,height:56,borderRadius:Radii.lg,backgroundColor:Colors.surfaceContainerLow,alignItems:'center',justifyContent:'center'},
  name:{fontSize:15,fontWeight:'700',color:Colors.onSurface},farm:{fontSize:12,color:Colors.onSurfaceVariant,marginTop:1},
  price:{fontSize:14,fontWeight:'700',color:Colors.primary,marginTop:4},
  summary:{backgroundColor:Colors.surfaceContainerLowest,borderRadius:Radii.xl,padding:Spacing.lg,marginTop:Spacing.md,...Shadows.sm},
  row:{flexDirection:'row',justifyContent:'space-between'},lbl:{fontSize:16,fontWeight:'800',color:Colors.onSurface},val:{fontSize:16,fontWeight:'800',color:Colors.primary},
  btn:{backgroundColor:Colors.primaryContainer,borderRadius:Radii.full,paddingVertical:18,alignItems:'center',marginTop:Spacing.lg,...Shadows.glow(Colors.primaryContainer)},
  btnText:{fontSize:17,fontWeight:'700',color:Colors.onPrimary},
  tabBar:{position:'absolute',bottom:0,left:0,right:0,flexDirection:'row',backgroundColor:'rgba(255,255,255,0.95)',paddingVertical:10,paddingBottom:28,justifyContent:'space-around'},
  tab:{alignItems:'center',gap:2},tI:{fontSize:20,opacity:0.5},tIA:{fontSize:20},tL:{fontSize:9,fontWeight:'500',color:Colors.onSurfaceVariant},tLA:{fontSize:9,fontWeight:'700',color:Colors.primary},
});
