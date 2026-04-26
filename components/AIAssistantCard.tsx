import { useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Card, PrimaryButton, TextField } from '@/components/app-ui';
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
    if (!symptoms.trim()) {
      return;
    }

    setLoading(true);
    setResponse(await askVetAssistant(symptoms));
    setLoading(false);
  };

  return (
    <Card tone="blue">
      <Text style={{ color: '#0f172a', fontSize: 17, fontWeight: '900' }}>Assistant IA local</Text>
      <TextField
        label="Symptomes"
        multiline
        onChangeText={setSymptoms}
        placeholder="Decrivez les symptomes du lot..."
        style={{ minHeight: 82, textAlignVertical: 'top' }}
        value={symptoms}
      />
      <PrimaryButton disabled={loading || !symptoms.trim()} onPress={submit}>
        Analyser
      </PrimaryButton>
      {loading ? <ActivityIndicator color="#2563eb" /> : null}
      {response ? (
        <>
          <AWaReBadge awareClass={response.awareClass} />
          <Text style={{ color: '#0f172a', fontWeight: '800' }}>
            {response.molecule} - {response.atcCode} - retrait {response.withdrawalDays} jours
          </Text>
          <Text style={{ color: '#475569', lineHeight: 20 }}>{response.recommendation}</Text>
          <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '800' }}>
            100% local - Ollama phi3:mini
          </Text>
        </>
      ) : null}
    </Card>
  );
}
