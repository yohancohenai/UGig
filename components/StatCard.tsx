import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  value: string | number;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    minWidth: 100,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
