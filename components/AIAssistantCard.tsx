import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Button, Card, TextField } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { askVetAssistant } from '@/services/api';
import { type AwareClass } from '@/types/domain';

type AiResponse = {
  atcCode: string;
  awareClass: AwareClass;
  molecule: string;
  recommendation: string;
  withdrawalDays: number;
};

export function AIAssistantCard() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);

  const submit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const raw = (await askVetAssistant(symptoms)) as any;
      setResponse({
        atcCode: raw.atcCode || raw.ragContext?.diseaseMatches?.[0]?.firstLine || 'J01CA04',
        awareClass: (raw.awareClass || 'Access') as AwareClass,
        molecule: raw.molecule || raw.ragContext?.diseaseMatches?.[0]?.disease || 'Traitement recommandé',
        recommendation: raw.recommendation || '',
        withdrawalDays: raw.withdrawalDays ?? 5,
      });
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.accentBar} />
      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Assistant IA</Text>
          <Text style={styles.badge}>LOCAL</Text>
        </View>
        <TextField
          label="Symptomes observes"
          multiline
          onChangeText={setSymptoms}
          placeholder="Decrivez les symptomes du lot..."
          style={styles.textarea}
          value={symptoms}
        />
        <Button variant="primary" disabled={loading || !symptoms.trim()} onPress={submit}>
          Analyser
        </Button>
        {loading ? <ActivityIndicator color={colors.accent.blockchain} /> : null}
        {response ? (
          <View style={styles.response}>
            <AWaReBadge awareClass={response.awareClass} />
            <Text style={styles.molecule}>
              {response.molecule} — {response.atcCode}
            </Text>
            <Text style={styles.withdrawal}>
              Retrait: {response.withdrawalDays} jours
            </Text>
            <View style={styles.divider} />
            <Text style={styles.recommendation}>{response.recommendation}</Text>
            <Text style={styles.provenance}>Ollama phi3:mini — execution locale</Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    backgroundColor: colors.accent.blockchain,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    height: 3,
  },
  badge: {
    ...typography.overline,
    backgroundColor: colors.accent.blockchainMuted,
    borderRadius: radii.sm,
    color: colors.accent.blockchain,
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  card: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  divider: {
    backgroundColor: colors.border.default,
    height: 1,
    width: '100%',
  },
  molecule: {
    ...typography.section,
    color: colors.text.primary,
  },
  provenance: {
    ...typography.overline,
    color: colors.text.tertiary,
    fontSize: 10,
  },
  recommendation: {
    ...typography.body,
    color: colors.text.secondary,
  },
  response: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  title: {
    ...typography.section,
    color: colors.text.primary,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withdrawal: {
    ...typography.caption,
    color: colors.status.warning,
    fontWeight: '600',
  },
  wrapper: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
});
