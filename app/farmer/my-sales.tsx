import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Divider, PageHeader, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { colors, spacing, typography } from '@/constants/theme';
import { getFarmerOrders, updateOrderStatus } from '@/services/api';
import { type Order } from '@/services/mockData';

export default function MySalesScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getFarmerOrders().then(setOrders);
  }, []);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    setOrders((items) => items.map((item) => (item.id === orderId ? { ...item, status } : item)));
  };

  const grossRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const revenue = grossRevenue * 0.9;
  const commission = grossRevenue * 0.1;

  return (
    <Screen>
      <PageHeader
        eyebrow="ELEVEUR"
        subtitle="Commission plateforme: 10%, reversement eleveur: 90%."
        title="Mes ventes"
      />

      <Row>
        <Stat label="Revenu net" tone="success" value={`${revenue.toFixed(2)} TND`} />
        <Stat label="Commission" tone="warning" value={`${commission.toFixed(2)} TND`} />
      </Row>

      <SectionTitle>Commandes entrantes</SectionTitle>
      {orders.map((order) => (
        <Card key={order.id} tone={order.status === 'PENDING' ? 'warning' : 'success'}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{order.productTitle}</Text>
            <StatusChip
              label={order.status}
              tone={order.status === 'PENDING' ? 'warning' : 'success'}
            />
          </View>
          <Text style={styles.cardBody}>
            {order.consumerName} — quantite {order.quantity} — {order.total} TND
          </Text>
          <Divider />
          <Row>
            <Button compact onPress={() => updateStatus(order.id, 'CONFIRMED')}>
              Confirmer
            </Button>
            <Button variant="secondary" compact onPress={() => updateStatus(order.id, 'READY')}>
              Pret
            </Button>
          </Row>
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
