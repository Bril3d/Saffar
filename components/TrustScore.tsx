import { StyleSheet, Text, View } from 'react-native';

function scoreColor(value: number) {
  if (value >= 85) {
    return '#15803d';
  }

  if (value >= 65) {
    return '#ca8a04';
  }

  return '#dc2626';
}

export function TrustScore({ value }: { value: number }) {
  const color = scoreColor(value);

  return (
    <View style={[styles.gauge, { borderColor: color }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gauge: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 7,
    justifyContent: 'center',
    width: 96,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
  },
});
