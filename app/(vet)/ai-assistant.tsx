/**
 * Vet — AI Assistant Screen
 * Premium chat interface with glassmorphism bubbles and proper icons.
 */
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Radii, Shadows, Fonts } from '@/constants/theme';
import { askVetAssistant } from '@/services/api';
import { Home, ClipboardList, Bot, User, Send, Sparkles, AlertTriangle } from 'lucide-react-native';

const suggestions = [
  'Quelle posologie pour l\'Amoxicilline chez les poulets ?',
  'Alternatives Watch pour l\'Enrofloxacine ?',
  'Délai de retrait pour la Colistine chez les bovins ?',
];

export default function AIAssistantScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis votre assistant IA spécialisé en antibiothérapie vétérinaire et pratiques agricoles. Comment puis-je vous aider ?' },
  ]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;
    const userMsg = msg.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const res = await askVetAssistant(userMsg);
      let text = res.recommendation;
      if (res.guardrails?.warnings?.length) {
        const warningsText = res.guardrails.warnings.map((w: any) => w.message || w).join('\n⚠️ ');
        text += '\n\n⚠️ ' + warningsText;
      }
      if (res.disclaimer) {
        text += '\n\n_' + res.disclaimer + '_';
      }
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: (err?.response?.data?.error?.message || err?.message || 'Service IA indisponible') }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatarSmall}>
            <Bot size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Assistant IA</Text>
            <Text style={styles.headerSub}>Powered by Ollama · Local</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Messages */}
        {messages.map((msg, i) => (
          <View key={i} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
            {msg.role === 'assistant' && (
              <View style={styles.aiBubbleAvatar}>
                <Bot size={18} color={Colors.primary} />
              </View>
            )}
            <View style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.msgText, msg.role === 'user' && styles.userText]}>{msg.text}</Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.msgRow]}>
            <View style={styles.aiBubbleAvatar}>
              <Bot size={18} color={Colors.primary} />
            </View>
            <View style={[styles.msgBubble, styles.aiBubble, { paddingVertical: 16 }]}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, { opacity: 0.4 }]} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.8 }]} />
              </View>
            </View>
          </View>
        )}

        {/* Suggestions - only show if one message */}
        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            <View style={styles.sugHeader}>
              <Sparkles size={16} color={Colors.primary} />
              <Text style={styles.sugLabel}>Suggestions</Text>
            </View>
            {suggestions.map((s2, i) => (
              <TouchableOpacity key={i} style={styles.sugChip} onPress={() => sendMessage(s2)} activeOpacity={0.7}>
                <Text style={styles.sugText}>{s2}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput 
          style={styles.input} 
          placeholder="Posez votre question..." 
          placeholderTextColor={Colors.onSurfaceVariant} 
          value={query} 
          onChangeText={setQuery}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!query.trim() || loading) && styles.sendBtnDisabled]} 
          onPress={() => sendMessage(query)}
          disabled={!query.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : <Send size={20} color={Colors.onPrimary} />}
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/home')}>
          <Home size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/prescriptions')}>
          <ClipboardList size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Rx</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
          <Bot size={24} color={Colors.primary} />
          <Text style={styles.tabLabelActive}>IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={() => router.replace('/(vet)/profile')}>
          <User size={24} color={Colors.onSurfaceDisabled} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.outline,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiAvatarSmall: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.onSurface },
  headerSub: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 180 },
  
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.md, gap: Spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  
  aiBubbleAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  
  msgBubble: { borderRadius: Radii.lg, padding: Spacing.md, maxWidth: '78%' },
  aiBubble: { 
    backgroundColor: Colors.surface, 
    borderWidth: 1, borderColor: Colors.outline,
    borderBottomLeftRadius: 4,
    ...Shadows.sm
  },
  userBubble: { 
    backgroundColor: Colors.primary, 
    borderBottomRightRadius: 4,
    ...Shadows.sm
  },
  msgText: { fontSize: 15, color: Colors.onSurface, lineHeight: 22 },
  userText: { color: Colors.onPrimary },
  
  typingDots: { flexDirection: 'row', gap: 6, paddingHorizontal: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  
  suggestionsContainer: { marginTop: Spacing.xl },
  sugHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sugLabel: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  sugChip: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radii.lg, padding: Spacing.md, 
    marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.outline,
    ...Shadows.sm
  },
  sugText: { fontSize: 14, color: Colors.onSurface, lineHeight: 20 },
  
  inputBar: { 
    position: 'absolute', bottom: 72, left: 0, right: 0, 
    flexDirection: 'row', 
    paddingHorizontal: Spacing.lg, gap: Spacing.sm, 
    backgroundColor: Colors.surface, 
    paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.outline,
  },
  input: { 
    flex: 1, 
    backgroundColor: Colors.surfaceContainerLow, 
    borderRadius: Radii.full, 
    paddingHorizontal: Spacing.lg, paddingVertical: 14, 
    fontSize: 15, color: Colors.onSurface,
    maxHeight: 100,
    borderWidth: 1, borderColor: Colors.outline,
  },
  sendBtn: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm
  },
  sendBtnDisabled: { 
    backgroundColor: Colors.onSurfaceDisabled,
    opacity: 0.5,
  },
  
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
