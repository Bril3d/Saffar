import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, PageHeader, Screen, SectionTitle, StatusChip } from '@/components/app-ui';
import { colors, typography } from '@/constants/theme';
import { getFarmerOrders } from '@/services/api';
import { type Order } from '@/services/mockData';

export default function ConsumerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = () => {
    getFarmerOrders().then(setOrders);
  };

  useEffect(refresh, []);

  return (
    <Screen>
      <PageHeader
        eyebrow="CONSOMMATEUR"
        subtitle="Statuts synchronises avec le backend marketplace."
        title="Mes commandes"
      />

      <Button variant="secondary" onPress={refresh}>Rafraichir</Button>

      <SectionTitle>Historique</SectionTitle>
      {orders.map((order) => (
        <Card key={order.id} tone={order.status === 'DELIVERED' ? 'success' : 'info'}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{order.productTitle}</Text>
            <StatusChip
              label={order.status}
              tone={order.status === 'PENDING' ? 'warning' : 'success'}
            />
          </View>
          <Text style={styles.cardBody}>
            Quantite {order.quantity} — total {order.total} TND
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    ...typography.body,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.section,
    color: colors.text.primary,
    flex: 1,
  },
});
