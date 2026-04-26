import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { TrustScore } from '@/components/TrustScore';
import {
  Card,
  PageHeader,
  PrimaryButton,
  Row,
  Screen,
  SecondaryButton,
  SectionTitle,
  SegmentedControl,
  TextField,
} from '@/components/app-ui';
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
    <Screen>
      <PageHeader
        eyebrow="Role CONSUMER"
        subtitle="Catalogue certifie avec trace publique sans donnees privees."
        title="Marche certifie"
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
      <Card tone="green">
        <Text style={{ color: '#166534', fontWeight: '900' }}>
          Tous les produits affiches sont certifies blockchain.
        </Text>
      </Card>

      <Row>
        <PrimaryButton onPress={() => router.push('/consumer/scanner')}>Scanner QR</PrimaryButton>
        <PrimaryButton onPress={() => router.push('/consumer/orders')}>Mes commandes</PrimaryButton>
      </Row>

      <SectionTitle>Produits</SectionTitle>
      {visibleProducts.map((product) => (
        <Card key={product.id} tone="green">
          <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '900' }}>{product.title}</Text>
          <Text style={{ color: '#64748b' }}>{product.imageLabel}</Text>
          <Row>
            <TrustScore value={product.trustScore} />
            <Card>
              <Text style={{ color: '#0f172a', fontSize: 20, fontWeight: '900' }}>
                {product.price} TND / {product.unit}
              </Text>
              <Text style={{ color: '#475569' }}>{product.farmRegion}</Text>
              <AWaReBadge awareClass={product.awareClass} />
            </Card>
          </Row>
          <Row>
            <PrimaryButton
              onPress={() =>
                router.push({ pathname: '/consumer/product-detail', params: { id: product.id } })
              }>
              Voir
            </PrimaryButton>
            <SecondaryButton
              onPress={() => router.push({ pathname: '/consumer/checkout', params: { id: product.id } })}>
              Commander
            </SecondaryButton>
          </Row>
        </Card>
      ))}

      <PrimaryButton onPress={signOut}>Se deconnecter</PrimaryButton>
    </Screen>
  );
}
