import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={48} color={colors.borderLight} />
      <Text style={[styles.title, { color: colors.textTertiary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
