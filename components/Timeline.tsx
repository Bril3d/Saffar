import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

export type TimelineStep = {
  detail: string;
  status?: 'done' | 'active' | 'locked';
  title: string;
};

const STATUS_COLORS = {
  done: colors.status.success,
  active: colors.status.warning,
  locked: colors.text.tertiary,
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const status = step.status ?? 'locked';
        const color = STATUS_COLORS[status];
        const isLast = index === steps.length - 1;

        return (
          <View key={`${step.title}-${index}`} style={styles.step}>
            <View style={styles.dotColumn}>
              <View style={[styles.dotOuter, { borderColor: color }]}>
                {status === 'done' ? (
                  <View style={[styles.dotFilled, { backgroundColor: color }]} />
                ) : null}
              </View>
              {!isLast ? (
                <View style={[styles.line, { backgroundColor: status === 'done' ? color : colors.border.default }]} />
              ) : null}
            </View>
            <View style={styles.content}>
              <Text style={[styles.title, { color: status === 'locked' ? colors.text.tertiary : colors.text.primary }]}>
                {step.title}
              </Text>
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
    gap: 0,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  detail: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  dotColumn: {
    alignItems: 'center',
    width: 24,
  },
  dotFilled: {
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
  dotOuter: {
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 2,
    height: 14,
    justifyContent: 'center',
    marginTop: 2,
    width: 14,
  },
  line: {
    flex: 1,
    marginVertical: spacing.xs,
    width: 1.5,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  title: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
