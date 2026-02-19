import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { usePayment } from '../../context/PaymentContext';
import { useNotification } from '../../context/NotificationContext';
import { useWallet } from '../../context/WalletContext';
import { formatCents } from '../../constants/MockData';
import StatCard from '../../components/StatCard';
import GigCard from '../../components/GigCard';
import NotificationModal from '../../components/NotificationModal';
import VerificationBanner from '../../components/VerificationBanner';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user, college, openCampusGigs, myAcceptedGigs } = useUser();
  const { totalEscrowCents } = usePayment();
  const { unreadCount } = useNotification();
  const { balanceCents } = useWallet();
  const router = useRouter();
  const recentGigs = openCampusGigs.slice(0, 3);
  const [notifVisible, setNotifVisible] = useState(false);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingName, { color: colors.text }]}>
            Hey, {user.name.split(' ')[0]}!
          </Text>
          {college && (
            <View style={styles.campusBadgeRow}>
              <Ionicons name="school" size={13} color={colors.primary} />
              <Text style={[styles.campusBadgeText, { color: colors.primary }]}>
                {college.name}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.greetingRight}>
          <Pressable onPress={() => setNotifVisible(true)} style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.bellBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.bellBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        </View>
      </View>

      <VerificationBanner onVerify={() => router.push('/(tabs)/settings')} />

      {/* Campus Banner */}
      {college && (
        <View style={[styles.campusBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <View style={styles.campusBannerLeft}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <View>
              <Text style={[styles.campusBannerTitle, { color: colors.primary }]}>
                {college.shortName} Campus Feed
              </Text>
              <Text style={[styles.campusBannerSub, { color: colors.textSecondary }]}>
                {college.location}
              </Text>
            </View>
          </View>
          <Text style={[styles.campusGigCount, { color: colors.primary }]}>
            {openCampusGigs.length} open
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={openCampusGigs.length} label="Available" />
        <StatCard value={myAcceptedGigs.length} label="Active" />
        <StatCard value={formatCents(balanceCents)} label="Wallet" />
      </View>

      {/* Escrow Summary */}
      {totalEscrowCents > 0 && (
        <View style={[styles.escrowBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
          <Ionicons name="lock-closed" size={16} color={colors.warning} />
          <Text style={[styles.escrowText, { color: colors.warning }]}>
            {formatCents(totalEscrowCents)} held in escrow
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => router.push('/(tabs)/browse')}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="search" size={24} color={isDark ? '#0f1117' : '#fff'} />
          <Text style={[styles.actionText, { color: isDark ? '#0f1117' : '#fff' }]}>Browse Gigs</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(tabs)/post')}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Post a Gig</Text>
        </Pressable>
      </View>

      {/* My Active Jobs */}
      {myAcceptedGigs.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Active Jobs</Text>
            <Pressable onPress={() => router.push('/(tabs)/my-jobs')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          {myAcceptedGigs.slice(0, 3).map(gig => (
            <GigCard key={gig.id} gig={gig} showPoster />
          ))}
        </>
      )}

      {/* Recent Gigs */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Gigs</Text>
        <Pressable onPress={() => router.push('/(tabs)/browse')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </Pressable>
      </View>
      {recentGigs.length > 0 ? (
        recentGigs.map(gig => (
          <GigCard key={gig.id} gig={gig} showPoster />
        ))
      ) : (
        <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
          No gigs posted on your campus yet.
        </Text>
      )}

      <NotificationModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  campusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  campusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  greetingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  campusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  campusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  campusBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  campusBannerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  campusGigCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  escrowText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
