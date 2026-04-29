/**
 * Consumer — Cart Screen
 * Cart is stored in-memory (per session). Items are added from product-detail.
 * "Commander" calls POST /api/orders for each item.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { createOrder } from '@/services/api';
import { Home, ScanLine, FileText, User, CheckCircle2 } from 'lucide-react-native';


// Simple in-memory cart store (shared via module-level state)
export type CartItem = {
  productId: string;
  name: string;
  farm: string;
  price: number;
  qty: number;
};

let _cartItems: CartItem[] = [];
export function getCartItems() { return _cartItems; }
export function addToCart(item: CartItem) {
  const existing = _cartItems.find((i) => i.productId === item.productId);
  if (existing) { existing.qty += item.qty; }
  else { _cartItems = [..._cartItems, item]; }
}
export function clearCart() { _cartItems = []; }

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true); setError('');
    try {
      for (const item of items) {
        await createOrder({
          productId: item.productId,
          quantity: item.qty,
          deliveryOption: 'PICKUP',
        });
      }
      clearCart();
      setItems([]);
      router.replace('/(consumer)/orders');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={st.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}> Mon Panier</Text>
        {items.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.onSurfaceVariant, marginTop: 30 }}>Panier vide</Text>
        ) : items.map((item, i) => (
          <View key={item.productId || i} style={st.card}>
            <View style={st.emoji}><CheckCircle2 size={28} color={Colors.onPrimary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{item.name}</Text>
              <Text style={st.farm}>{item.farm}</Text>
              <Text style={st.price}>{item.price.toFixed(3)} TND × {item.qty}</Text>
            </View>
          </View>
        ))}
        {items.length > 0 && (
          <View style={st.summary}>
            <View style={st.row}><Text style={st.lbl}>Total</Text><Text style={st.val}>{total.toFixed(3)} TND</Text></View>
          </View>
        )}
        {!!error && <Text style={{ color: Colors.onErrorContainer, textAlign: 'center', marginTop: Spacing.sm }}>️ {error}</Text>}
        <TouchableOpacity style={[st.btn, (loading || items.length === 0) && { opacity: 0.6 }]} activeOpacity={0.85} onPress={handleOrder} disabled={loading || items.length === 0}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={st.btnText}>Commander</Text>}
        </TouchableOpacity>
      </ScrollView>
      <View style={st.tabBar}>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/scanner')}><ScanLine size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab}><FileText size={24} color={Colors.onSurfaceVariant} /><Text style={st.tLA}>Panier</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/orders')}><FileText size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Commandes</Text></TouchableOpacity>
        <TouchableOpacity style={st.tab} onPress={() => router.replace('/(consumer)/profile')}><User size={24} color={Colors.onSurfaceVariant} /><Text style={st.tL}>Profil</Text></TouchableOpacity>
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
