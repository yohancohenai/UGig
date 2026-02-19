import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Payment, PaymentStatus } from '../constants/MockData';
import { formatCents } from '../constants/MockData';

interface EscrowStatusProps {
  payment: Payment;
  /** Show the full breakdown (amount, fee, payout) */
  showBreakdown?: boolean;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: string; colorKey: 'warning' | 'success' | 'textSecondary' | 'danger' }> = {
  pending: { label: 'Payment Pending', icon: 'time-outline', colorKey: 'textSecondary' },
  in_escrow: { label: 'In Escrow', icon: 'lock-closed-outline', colorKey: 'warning' },
  released: { label: 'Released', icon: 'checkmark-circle-outline', colorKey: 'success' },
  refunded: { label: 'Refunded', icon: 'return-down-back-outline', colorKey: 'danger' },
};

export default function EscrowStatus({ payment, showBreakdown = false }: EscrowStatusProps) {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[payment.status];
  const statusColor = colors[config.colorKey];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.statusRow}>
        <Ionicons name={config.icon as any} size={18} color={statusColor} />
        <Text style={[styles.statusLabel, { color: statusColor }]}>{config.label}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCents(payment.amountCents)}
        </Text>
      </View>

      {showBreakdown && (
        <View style={[styles.breakdown, { borderTopColor: colors.border }]}>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Total Amount</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {formatCents(payment.amountCents)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Platform Fee (10%)</Text>
            <Text style={[styles.breakdownValue, { color: colors.danger }]}>
              -{formatCents(payment.serviceFeeCents)}
            </Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={[styles.breakdownLabel, { color: colors.text, fontWeight: '700' }]}>Worker Payout</Text>
            <Text style={[styles.breakdownValue, { color: colors.success, fontWeight: '700' }]}>
              {formatCents(payment.netPayoutCents)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[status];
  const statusColor = colors[config.colorKey];

  const bgMap: Record<PaymentStatus, string> = {
    pending: colors.border,
    in_escrow: colors.warningLight,
    released: colors.successLight,
    refunded: colors.dangerLight,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[status] }]}>
      <Ionicons name={config.icon as any} size={10} color={statusColor} />
      <Text style={[styles.badgeText, { color: statusColor }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  breakdown: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownTotal: {
    marginTop: 4,
    paddingTop: 8,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
