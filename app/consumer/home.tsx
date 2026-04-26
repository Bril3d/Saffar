import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { TrustScore } from '@/components/TrustScore';
import {
    Button,
    Card,
    Divider,
    PageHeader,
    Row,
    Screen,
    SectionTitle,
    SegmentedControl,
    TextField,
} from '@/components/app-ui';
import { AR_PRODUCT_KINDS, AR_REGIONS, formatPrice } from '@/constants/locale';
import { colors, spacing, typography } from '@/constants/theme';
import { getProducts } from '@/services/api';
import { type Product } from '@/services/mockData';
import { useAuthStore } from '@/store/authStore';

export default function ConsumerHomeScreen() {
  const [category, setCategory] = useState('Tous');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    getProducts(category === 'Tous' ? undefined : category).then(setProducts);
  }, [category]);

  const visibleProducts = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen variant="warm">
      <PageHeader
        role={{ label: 'Consommateur', accent: colors.role.consumer }}
        breadcrumb="Marketplace"
        subtitle="Manger sain. Tracé sur la chaîne."
        title="Marché certifié"
      />

      <TextField label="Recherche" onChangeText={setSearch} placeholder="Poulet, oeufs..." value={search} />
      <SegmentedControl
        onChange={setCategory}
        options={[
          { label: 'Tous', value: 'Tous' },
          { label: 'Poulet', value: 'Poulet' },
          { label: 'Oeufs', value: 'Oeufs' },
        ]}
        value={category}
      />

      <Card tone="success">
        <Text style={styles.certNotice}>
          Tous les produits affiches sont certifies blockchain.
        </Text>
      </Card>

      <Row>
        <Button variant="secondary" onPress={() => router.push('/consumer/scanner')}>
          Scanner QR
        </Button>
        <Button variant="secondary" onPress={() => router.push('/consumer/orders')}>
          Mes commandes
        </Button>
      </Row>

      <SectionTitle>Produits</SectionTitle>
      {visibleProducts.map((product) => {
        const arRegion = AR_REGIONS[product.farmRegion];
        const arKind = AR_PRODUCT_KINDS[product.category];
        return (
          <Card key={product.id}>
            <Text style={styles.productTitle}>{product.title}</Text>
            {arRegion && arKind ? (
              <Text style={styles.productAr}>{`${arKind} — ${arRegion}`}</Text>
            ) : null}
            <Text style={styles.productLabel}>{product.imageLabel}</Text>
            <View style={styles.productRow}>
              <TrustScore score={product.trustScore} compact />
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>
                  {formatPrice(product.price)} / {product.unit}
                </Text>
                <Text style={styles.region}>{product.farmRegion}</Text>
                <AWaReBadge awareClass={product.awareClass} />
              </View>
            </View>
            <Row gap={spacing.sm}>
              <Button
                compact
                onPress={() =>
                  router.push({ pathname: '/consumer/product-detail', params: { id: product.id } })
                }>
                Voir
              </Button>
              <Button
                variant="secondary"
                compact
                onPress={() => router.push({ pathname: '/consumer/checkout', params: { id: product.id } })}>
                Commander
              </Button>
            </Row>
          </Card>
        );
      })}

      <Divider />
      <Button variant="ghost" onPress={signOut}>Se deconnecter</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  certNotice: {
    ...typography.body,
    color: colors.status.success,
    fontWeight: '600',
  },
  price: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  productAr: {
    color: colors.accent.sand,
    fontSize: 13,
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  priceInfo: {
    gap: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  productLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  productRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  productTitle: {
    ...typography.section,
    color: colors.text.primary,
    fontSize: 18,
  },
  region: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
