/**
 * Farmer — AI Assistant Screen
 * Chatbot for lot management advice, withdrawal periods, best practices.
 * Calls POST /api/ai/assistant/farmer via askFarmerAssistant().
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { askFarmerAssistant } from '@/services/api';
import { Home, Package, ShoppingCart, User, Bot, Send, Tractor } from 'lucide-react-native';

const suggestions = [
  'Quand mon lot peut-il être abattu ?',
  'Comment réduire le délai de retrait ?',
  'Quelles sont les bonnes pratiques d\'élevage ?',
  'Mon lot a reçu de la Colistine, quels risques ?',
];

export default function FarmerAIAssistantScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis votre assistant IA pour la gestion de votre exploitation. Posez-moi vos questions sur les lots, les délais de retrait, ou les bonnes pratiques.' },
  ]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setQuery('');
    setLoading(true);
    try {
      const res = await askFarmerAssistant(msg);
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ ' + (err?.response?.data?.error?.message || err?.message || 'Service IA indisponible') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Assistant IA</Text>
        <Text style={s.subtitle}>Conseils personnalisés pour votre exploitation</Text>

        {/* Messages */}
        {messages.map((msg, i) => (
          <View key={i} style={[s.msgBubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
            {msg.role === 'assistant' && <Tractor size={20} color={Colors.primary} />}
            <Text style={[s.msgText, msg.role === 'user' && s.userText]}>{msg.text}</Text>
          </View>
        ))}

        {loading && (
          <View style={s.aiBubble}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={s.msgText}>Réflexion en cours...</Text>
          </View>
        )}

        {/* Suggestions */}
        {messages.length <= 1 && <>
          <Text style={s.sugLabel}>Suggestions</Text>
          {suggestions.map((sug, i) => (
            <TouchableOpacity key={i} style={s.sugChip} onPress={() => sendMessage(sug)} activeOpacity={0.7}>
              <Text style={s.sugText}>💡 {sug}</Text>
            </TouchableOpacity>
          ))}
        </>}
      </ScrollView>

      {/* Input */}
      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          placeholder="Posez votre question..."
          placeholderTextColor={Colors.outline}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => sendMessage(query)}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!query.trim() || loading) && { opacity: 0.5 }]}
          onPress={() => sendMessage(query)}
          disabled={!query.trim() || loading}
          activeOpacity={0.7}
        >
          <Send size={20} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/home')}><Home size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/lots')}><Package size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Mes Lots</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Bot size={24} color={Colors.primary} /><Text style={s.tabLabelActive}>IA</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(farmer)/profile')}><User size={24} color={Colors.onSurfaceVariant} /><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 180 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  msgBubble: { borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, maxWidth: '85%' },
  aiBubble: { backgroundColor: Colors.surfaceContainerLowest, alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', ...Shadows.sm },
  userBubble: { backgroundColor: Colors.primaryContainer, alignSelf: 'flex-end' },
  msgText: { fontSize: 14, color: Colors.onSurface, lineHeight: 20, flex: 1 },
  userText: { color: Colors.onPrimary },
  sugLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sugChip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  sugText: { fontSize: 13, color: Colors.onSurface, lineHeight: 18 },
  inputBar: { position: 'absolute', bottom: 70, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, backgroundColor: Colors.surface, paddingVertical: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 14, color: Colors.onSurface },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
