import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography, withAlpha } from '@/constants/theme';

export type TimelineStep = {
  detail: string;
  status?: 'done' | 'active' | 'locked';
  title: string;
  timestamp?: string;
  actor?: string;
  actorRole?: { label: string; accent: string };
  hash?: string;
};

const STATUS_COLORS = {
  done: colors.status.success,
  active: colors.accent.primary,
  locked: colors.text.tertiary,
};

/**
 * Vertical timeline with a 1px thread, circular nodes (check for done,
 * filled for active, outlined for future). Each step is a mini-card
 * with expandable details.
 */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const status = step.status ?? 'locked';
        const color = STATUS_COLORS[status];
        const isLast = index === steps.length - 1;
        return (
          <TimelineRow
            key={`${step.title}-${index}`}
            step={step}
            status={status}
            color={color}
            isLast={isLast}
          />
        );
      })}
    </View>
  );
}

function TimelineRow({
  step,
  status,
  color,
  isLast,
}: {
  step: TimelineStep;
  status: 'done' | 'active' | 'locked';
  color: string;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !!step.hash || !!step.detail;

  return (
    <View style={styles.step}>
      <View style={styles.dotColumn}>
        <View
          style={[
            styles.dotOuter,
            { borderColor: color, backgroundColor: status === 'active' ? withAlpha(color, 0.2) : colors.bg.primary },
          ]}>
          {status === 'done' ? (
            <Text style={[styles.check, { color }]}>✓</Text>
          ) : status === 'active' ? (
            <View style={[styles.dotFilled, { backgroundColor: color }]} />
          ) : null}
        </View>
        {!isLast ? (
          <View
            style={[
              styles.line,
              { backgroundColor: status === 'done' ? color : colors.border.strong },
            ]}
          />
        ) : null}
      </View>
      <Pressable
        onPress={() => canExpand && setExpanded((x) => !x)}
        style={styles.content}
        disabled={!canExpand}>
        <View style={styles.contentHeader}>
          <Text
            style={[
              styles.title,
              { color: status === 'locked' ? colors.text.tertiary : colors.text.primary },
            ]}>
            {step.title}
          </Text>
          {step.actorRole ? (
            <View
              style={[
                styles.actorChip,
                {
                  borderColor: withAlpha(step.actorRole.accent, 0.3),
                  backgroundColor: withAlpha(step.actorRole.accent, 0.1),
                },
              ]}>
              <Text style={[styles.actorChipLabel, { color: step.actorRole.accent }]}>
                {step.actorRole.label}
              </Text>
            </View>
          ) : null}
        </View>
        {step.timestamp ? <Text style={styles.timestamp}>{step.timestamp}</Text> : null}
        {step.actor ? <Text style={styles.actor}>{step.actor}</Text> : null}
        <Text style={styles.detail}>{step.detail}</Text>
        {expanded && step.hash ? (
          <View style={styles.hashBox}>
            <Text style={styles.hashLabel}>Hash on-chain</Text>
            <Text selectable style={styles.hashText}>
              {step.hash}
            </Text>
          </View>
        ) : null}
        {canExpand ? (
          <Text style={styles.expandLabel}>{expanded ? '▴ Masquer' : '▾ Détails'}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actor: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actorChip: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  actorChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  check: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  container: {
    gap: 0,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  contentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detail: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
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
    height: 18,
    justifyContent: 'center',
    marginTop: 2,
    width: 18,
  },
  expandLabel: {
    ...typography.caption,
    color: colors.accent.blockchain,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  hashBox: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.subtle,
    borderRadius: radii.sm,
    borderWidth: 1,
    gap: 4,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  hashLabel: {
    ...typography.overline,
    color: colors.accent.blockchain,
    fontSize: 10,
  },
  hashText: {
    color: colors.accent.blockchain,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
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
  timestamp: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  title: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
