import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Gig } from '../constants/MockData';
import { PaymentBadge } from './EscrowStatus';

interface GigCardProps {
  gig: Gig;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  showPoster?: boolean;
}

export default function GigCard({ gig, onPress, actionLabel, onAction, showPoster = true }: GigCardProps) {
  const { colors } = useTheme();

  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: colors.successLight, text: colors.success },
    pending: { bg: '#fef3c7', text: '#d97706' },
    accepted: { bg: colors.warningLight, text: colors.warning },
    completed: { bg: colors.primaryLight, text: colors.primary },
  };
  const sc = statusColors[gig.status] ?? statusColors.open;
  const STATUS_LABELS: Record<string, string> = { open: 'OPEN', pending: 'PENDING', accepted: 'ACCEPTED', completed: 'COMPLETED' };
  const statusLabel = STATUS_LABELS[gig.status] ?? 'OPEN';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {gig.title}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{statusLabel}</Text>
          </View>
          {gig.payment && <PaymentBadge status={gig.payment.status} />}
          {gig.completionStatus === 'pending_confirmation' && (
            <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
              <Text style={[styles.badgeText, { color: '#d97706' }]}>AWAITING CONFIRM</Text>
            </View>
          )}
          {gig.disputeStatus === 'disputed' && (
            <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.badgeText, { color: '#ef4444' }]}>DISPUTED</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textTertiary }]} numberOfLines={2}>
        {gig.description}
      </Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{gig.pay}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{gig.location}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {showPoster && (
          <Text style={[styles.posterText, { color: colors.textSecondary }]}>
            {gig.posterName} · {gig.posterSchool}
          </Text>
        )}
        {gig.status === 'pending' && (
          <Text style={[styles.pendingText, { color: '#d97706' }]}>
            Waiting for poster to confirm...
          </Text>
        )}
        {(gig.status === 'accepted' || gig.status === 'completed') && gig.acceptedBy && !actionLabel && (
          <Text style={[styles.acceptedText, { color: colors.success }]}>
            {gig.status === 'completed' ? 'Completed by' : 'Accepted by'} {gig.acceptedBy}
          </Text>
        )}
        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  posterText: {
    fontSize: 12,
    flex: 1,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  acceptedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
