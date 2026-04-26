import { StyleSheet, Text, View } from 'react-native';

export type TimelineStep = {
  detail: string;
  status?: 'done' | 'active' | 'locked';
  title: string;
};

const COLORS = {
  active: '#ca8a04',
  done: '#15803d',
  locked: '#94a3b8',
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const status = step.status ?? 'locked';

        return (
          <View key={`${step.title}-${index}`} style={styles.step}>
            <View style={[styles.dot, { backgroundColor: COLORS[status] }]} />
            <View style={styles.copy}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.detail}>{step.detail}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  detail: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  dot: {
    borderRadius: 999,
    height: 14,
    marginTop: 3,
    width: 14,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '900',
  },
});
