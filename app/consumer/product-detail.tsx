import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { TrustScore } from '@/components/TrustScore';
import { Card, PageHeader, PrimaryButton, Row, Screen, StatusChip } from '@/components/app-ui';
import { productById } from '@/services/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const product = productById(id);

  return (
    <Screen>
      <PageHeader
        eyebrow={product.category}
        subtitle="Identite exacte de la ferme masquee cote consommateur."
        title={product.title}
      />

      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#dcfce7',
          borderRadius: 8,
          height: 180,
          justifyContent: 'center',
        }}>
        <Text style={{ color: '#166534', fontSize: 28, fontWeight: '900' }}>{product.imageLabel}</Text>
      </View>

      <Card tone="green">
        <Row>
          <TrustScore value={product.trustScore} />
          <Card>
            <StatusChip label="Eleveur certifie" tone="green" />
            <Text style={{ color: '#475569' }}>Region: {product.farmRegion}</Text>
            <AWaReBadge awareClass={product.awareClass} />
          </Card>
        </Row>
        <Text style={{ color: '#0f172a', fontSize: 22, fontWeight: '900' }}>
          {product.price} TND / {product.unit}
        </Text>
        <PrimaryButton
          onPress={() =>
            router.push({ pathname: '/consumer/traceability', params: { lotId: product.lotId } })
          }>
          Tracabilite QR
        </PrimaryButton>
        <PrimaryButton onPress={() => router.push({ pathname: '/consumer/checkout', params: { id: product.id } })}>
          Commander
        </PrimaryButton>
      </Card>
    </Screen>
  );
}
