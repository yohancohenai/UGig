import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useReview } from '../context/ReviewContext';
import type { Gig } from '../constants/MockData';
import EscrowStatus, { PaymentBadge } from './EscrowStatus';
import ReviewCard from './ReviewCard';

interface GigDetailModalProps {
  gig: Gig | null;
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  onComplete?: () => void;
}

export default function GigDetailModal({ gig, visible, onClose, onAccept, onComplete }: GigDetailModalProps) {
  const { colors, isDark } = useTheme();

  if (!gig) return null;

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: colors.successLight, text: colors.success, label: 'OPEN' },
    pending: { bg: '#fef3c7', text: '#d97706', label: 'PENDING' },
    accepted: { bg: colors.warningLight, text: colors.warning, label: 'ACCEPTED' },
    completed: { bg: colors.primaryLight, text: colors.primary, label: 'COMPLETED' },
  };
  const sc = statusColors[gig.status] ?? statusColors.open;
  const isOpen = gig.status === 'open';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gig Details</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{gig.title}</Text>
            <View style={styles.badgeCol}>
              <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
              </View>
              {gig.payment && <PaymentBadge status={gig.payment.status} />}
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textTertiary }]}>
            {gig.description}
          </Text>

          <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow icon="cash-outline" label="Pay" value={gig.pay} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="location-outline" label="Location" value={gig.location} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="person-outline" label="Posted by" value={gig.posterName} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="school-outline" label="School" value={gig.posterSchool} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="calendar-outline" label="Posted" value={gig.createdAt} />
          </View>

          {gig.status === 'pending' && (
            <View style={[styles.acceptedBanner, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="hourglass-outline" size={18} color="#d97706" />
              <Text style={[styles.acceptedBannerText, { color: '#d97706' }]}>
                Waiting for {gig.posterName} to confirm and pay...
              </Text>
            </View>
          )}

          {(gig.status === 'accepted' || gig.status === 'completed') && gig.acceptedBy && (
            <View style={[styles.acceptedBanner, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.acceptedBannerText, { color: colors.success }]}>
                {gig.status === 'completed' ? 'Completed by' : 'Accepted by'} {gig.acceptedBy}
              </Text>
            </View>
          )}

          {/* Payment / Escrow Info */}
          {gig.payment && (
            <View style={styles.paymentSection}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>Payment</Text>
              <EscrowStatus payment={gig.payment} showBreakdown />
            </View>
          )}
        </ScrollView>

        {isOpen && onAccept && (
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
            <Pressable
              onPress={onAccept}
              style={({ pressed }) => [
                styles.acceptBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#0f1117' : '#fff'} />
              <Text style={[styles.acceptBtnText, { color: isDark ? '#0f1117' : '#fff' }]}>
                Accept This Gig
              </Text>
            </Pressable>
          </View>
        )}

        {gig.status === 'accepted' && onComplete && (
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
            <Pressable
              onPress={onComplete}
              style={({ pressed }) => [
                styles.acceptBtn,
                { backgroundColor: colors.success, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
              <Text style={[styles.acceptBtnText, { color: '#fff' }]}>
                Mark as Complete
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon as any} size={16} color={colors.textSecondary} />
        <Text style={[styles.infoLabelText, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    lineHeight: 28,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  infoSection: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  acceptedBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentSection: {
    marginTop: 20,
    gap: 10,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
