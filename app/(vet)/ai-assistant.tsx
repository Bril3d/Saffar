/**
 * Vet — AI Assistant Screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';

import { askVetAssistant } from '@/services/api';

const suggestions = [
  'Quelle posologie pour l\'Amoxicilline chez les poulets ?',
  'Alternatives Watch pour l\'Enrofloxacine ?',
  'Délai de retrait pour la Colistine chez les bovins ?',
];

export default function AIAssistantScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis votre assistant IA spécialisé en antibiothérapie vétérinaire. Comment puis-je vous aider ?' },
  ]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setQuery('');
    setLoading(true);
    try {
      const res = await askVetAssistant(msg);
      let text = res.recommendation;
      if (res.guardrails?.warnings?.length) {
        text += '\n\n⚠️ ' + res.guardrails.warnings.join('\n⚠️ ');
      }
      text += '\n\n_' + res.disclaimer + '_';
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ ' + (err?.response?.data?.error?.message || err?.message || 'Service IA indisponible') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>🤖 Assistant IA</Text>
        <Text style={s.subtitle}>Powered by Ollama · Modèle local</Text>

        {/* Messages */}
        {messages.map((msg, i) => (
          <View key={i} style={[s.msgBubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
            {msg.role === 'assistant' && <Text style={s.aiAvatar}>🤖</Text>}
            <Text style={[s.msgText, msg.role === 'user' && s.userText]}>{msg.text}</Text>
          </View>
        ))}

        {/* Suggestions */}
        <Text style={s.sugLabel}>Suggestions</Text>
        {suggestions.map((s2, i) => (
          <TouchableOpacity key={i} style={s.sugChip} onPress={() => sendMessage(s2)}>
            <Text style={s.sugText}>💡 {s2}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={s.inputBar}>
        <TextInput style={s.input} placeholder="Posez votre question..." placeholderTextColor={Colors.outline} value={query} onChangeText={setQuery} />
        <TouchableOpacity style={s.sendBtn} onPress={() => sendMessage(query)}><Text style={s.sendIcon}>↑</Text></TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/home')}><Text style={s.tabIcon}>🏠</Text><Text style={s.tabLabel}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/prescriptions')}><Text style={s.tabIcon}>📋</Text><Text style={s.tabLabel}>Rx</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab}><Text style={s.tabIconActive}>🤖</Text><Text style={s.tabLabelActive}>IA</Text></TouchableOpacity>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/(vet)/profile')}><Text style={s.tabIcon}>👤</Text><Text style={s.tabLabel}>Profil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 160 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2, marginBottom: Spacing.lg },
  msgBubble: { borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, maxWidth: '85%' },
  aiBubble: { backgroundColor: Colors.surfaceContainerLowest, alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', ...Shadows.sm },
  userBubble: { backgroundColor: Colors.primaryContainer, alignSelf: 'flex-end' },
  aiAvatar: { fontSize: 18, marginTop: 2 },
  msgText: { fontSize: 14, color: Colors.onSurface, lineHeight: 20, flex: 1 },
  userText: { color: Colors.onPrimary },
  sugLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sugChip: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  sugText: { fontSize: 13, color: Colors.onSurface, lineHeight: 18 },
  inputBar: { position: 'absolute', bottom: 70, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, backgroundColor: Colors.surface, paddingVertical: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 14, color: Colors.onSurface },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { fontSize: 20, fontWeight: '700', color: Colors.onPrimary },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 10, paddingBottom: 28, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 22, opacity: 0.5 }, tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant }, tabLabelActive: { fontSize: 10, fontWeight: '700', color: Colors.primary },
});
