import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type ButtonProps = {
  children: string;
  disabled?: boolean;
  onPress?: () => void;
};

type CardProps = {
  children: ReactNode;
  tone?: 'default' | 'green' | 'amber' | 'red' | 'blue';
};

type TextFieldProps = TextInputProps & {
  label: string;
};

const TONES = {
  amber: '#ca8a04',
  blue: '#2563eb',
  default: '#cbd5e1',
  green: '#15803d',
  red: '#dc2626',
};

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, tone = 'default' }: CardProps) {
  return <View style={[styles.card, { borderLeftColor: TONES[tone] }]}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  tone?: keyof typeof TONES;
  value: string;
}) {
  return (
    <View style={[styles.stat, { borderColor: TONES[tone] }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({ children, disabled, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled ? styles.disabledButton : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}>
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, disabled, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled ? styles.disabledButton : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}>
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
}: {
  onChange: (value: TValue) => void;
  options: { label: string; value: TValue }[];
  value: TValue;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected ? styles.segmentSelected : undefined]}>
            <Text style={[styles.segmentText, selected ? styles.segmentTextSelected : undefined]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StatusChip({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: `${TONES[tone]}20` }]}>
      <Text style={[styles.chipText, { color: TONES[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderLeftWidth: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  disabledButton: {
    opacity: 0.45,
  },
  eyebrow: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#166534',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  screen: {
    backgroundColor: '#f8fafc',
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  segment: {
    alignItems: 'center',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
  },
  segmentSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#15803d',
  },
  segmentText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: '#166534',
  },
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    gap: 4,
    minWidth: 96,
    padding: 12,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
});
