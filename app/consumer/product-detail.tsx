import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { TrustScore } from '@/components/TrustScore';
import { Button, Card, Divider, PageHeader, Screen, StatusChip } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { productById } from '@/services/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const product = productById(id);

  return (
    <Screen>
      <PageHeader
        eyebrow={product.category.toUpperCase()}
        subtitle="Identite exacte de la ferme masquee cote consommateur."
        title={product.title}
      />

      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageLabel}>{product.imageLabel}</Text>
      </View>

      <Card tone="success">
        <TrustScore value={product.trustScore} />
        <Divider />
        <StatusChip label="Eleveur certifie" tone="success" />
        <Text style={styles.region}>Region: {product.farmRegion}</Text>
        <AWaReBadge awareClass={product.awareClass} />
        <Divider />
        <Text style={styles.price}>{product.price} TND / {product.unit}</Text>
      </Card>

      <Button
        onPress={() =>
          router.push({ pathname: '/consumer/traceability', params: { lotId: product.lotId } })
        }>
        Voir la tracabilite
      </Button>
      <Button
        variant="secondary"
        onPress={() => router.push({ pathname: '/consumer/checkout', params: { id: product.id } })}>
        Commander
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.accent.primarySubtle,
    borderColor: colors.border.default,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 180,
    justifyContent: 'center',
  },
  imageLabel: {
    ...typography.title,
    color: colors.accent.primary,
  },
  price: {
    ...typography.title,
    color: colors.text.primary,
  },
  region: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
