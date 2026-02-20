import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import type { NotificationType } from '../constants/MockData';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NOTIF_ICONS: Record<NotificationType, { name: string; color: string }> = {
  gig_accepted: { name: 'hourglass-outline', color: '#d97706' },
  gig_confirmed: { name: 'checkmark-circle', color: '#16a34a' },
  payment_submitted: { name: 'card-outline', color: '#2563eb' },
  payment_released: { name: 'cash-outline', color: '#16a34a' },
  gig_completed: { name: 'checkmark-done', color: '#6366f1' },
  new_gig: { name: 'megaphone-outline', color: '#0891b2' },
  withdrawal: { name: 'arrow-down-circle', color: '#6366f1' },
  verification_complete: { name: 'shield-checkmark', color: '#16a34a' },
  id_verified: { name: 'id-card', color: '#6366f1' },
  gig_funded: { name: 'card-outline', color: '#635bff' },
  completion_requested: { name: 'hourglass', color: '#d97706' },
  completion_confirmed: { name: 'checkmark-done-circle', color: '#16a34a' },
  auto_released: { name: 'timer-outline', color: '#d97706' },
  dispute_opened: { name: 'alert-circle', color: '#ef4444' },
};

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { colors } = useTheme();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <Pressable onPress={markAllAsRead} hitSlop={8}>
                <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No notifications yet
              </Text>
            </View>
          ) : (
            notifications.map(notif => {
              const iconConfig = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.gig_confirmed;
              return (
                <Pressable
                  key={notif.id}
                  onPress={() => markAsRead(notif.id)}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: notif.read ? colors.surface : colors.primaryLight,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.notifIconWrap}>
                    <Ionicons name={iconConfig.name as any} size={22} color={iconConfig.color} />
                    {!notif.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                    <Text style={[styles.notifMessage, { color: colors.textTertiary }]}>
                      {notif.message}
                    </Text>
                    <Text style={[styles.notifDate, { color: colors.textSecondary }]}>
                      {notif.createdAt}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  markAllRead: { fontSize: 13, fontWeight: '600' },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 10 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  notifCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  notifIconWrap: { position: 'relative', paddingTop: 2 },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifContent: { flex: 1, gap: 4 },
  notifTitle: { fontSize: 14, fontWeight: '700' },
  notifMessage: { fontSize: 13, lineHeight: 19 },
  notifDate: { fontSize: 11, marginTop: 2 },
});
