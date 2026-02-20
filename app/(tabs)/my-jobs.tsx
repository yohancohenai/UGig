import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { usePayment } from '../../context/PaymentContext';
import { useReview } from '../../context/ReviewContext';
import { useGigFlow } from '../../context/GigFlowContext';
import { useWallet } from '../../context/WalletContext';
import { formatCents, CURRENT_USER } from '../../constants/MockData';
import VerificationBanner from '../../components/VerificationBanner';
import type { Gig } from '../../constants/MockData';
import GigCard from '../../components/GigCard';
import GigDetailModal from '../../components/GigDetailModal';
import ReviewModal from '../../components/ReviewModal';
import EmptyState from '../../components/EmptyState';

type Tab = 'active' | 'completed' | 'posted';

export default function MyJobsScreen() {
  const { colors } = useTheme();
  const { myAcceptedGigs, myPostedGigs } = useUser();
  const { totalEarnedCents, totalEscrowCents } = usePayment();
  const { hasReviewed, submitReview } = useReview();
  const { markComplete, confirmCompletion, openDispute, getAutoReleaseRemaining } = useGigFlow();
  const { balanceCents } = useWallet();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [reviewGig, setReviewGig] = useState<Gig | null>(null);
  const [autoReleaseSecs, setAutoReleaseSecs] = useState<number | null>(null);

  // Update auto-release countdown every second when a gig is selected
  useEffect(() => {
    if (!selectedGig || selectedGig.completionStatus !== 'pending_confirmation') {
      setAutoReleaseSecs(null);
      return;
    }
    const tick = () => setAutoReleaseSecs(getAutoReleaseRemaining(selectedGig.id));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selectedGig, getAutoReleaseRemaining]);

  const activeGigs = myAcceptedGigs.filter(g => g.status === 'accepted');
  const completedGigs = myAcceptedGigs.filter(g => g.status === 'completed');

  const getTabGigs = () => {
    if (tab === 'active') return activeGigs;
    if (tab === 'completed') return completedGigs;
    return myPostedGigs;
  };
  const gigs = getTabGigs();

  const renderGigAction = (item: Gig) => {
    if (tab === 'posted') {
      // Poster actions
      if (item.completionStatus === 'pending_confirmation' && item.disputeStatus !== 'disputed') {
        return { label: 'Confirm', action: () => { confirmCompletion(item.id); } };
      }
      return { label: undefined, action: undefined };
    }

    // Worker actions
    const canComplete = item.status === 'accepted' && item.completionStatus !== 'pending_confirmation';
    const canReview = item.status === 'completed' && !hasReviewed(item.id, CURRENT_USER.id);

    if (canComplete) return { label: 'Mark Complete', action: () => markComplete(item.id) };
    if (canReview) return { label: 'Leave Review', action: () => setReviewGig(item) };
    return { label: undefined, action: undefined };
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <VerificationBanner onVerify={() => router.push('/(tabs)/settings')} />
      </View>

      {/* Earnings Summary */}
      <View style={styles.earningsRow}>
        <View style={[styles.earningCard, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="wallet" size={16} color={colors.primary} />
          <Text style={[styles.earningAmount, { color: colors.primary }]}>
            {formatCents(balanceCents)}
          </Text>
          <Text style={[styles.earningLabel, { color: colors.primary }]}>Wallet</Text>
        </View>
        {totalEscrowCents > 0 && (
          <View style={[styles.earningCard, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="lock-closed" size={16} color={colors.warning} />
            <Text style={[styles.earningAmount, { color: colors.warning }]}>
              {formatCents(totalEscrowCents)}
            </Text>
            <Text style={[styles.earningLabel, { color: colors.warning }]}>In Escrow</Text>
          </View>
        )}
        <View style={[styles.earningCard, { backgroundColor: colors.successLight }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.earningAmount, { color: colors.success }]}>
            {formatCents(totalEarnedCents)}
          </Text>
          <Text style={[styles.earningLabel, { color: colors.success }]}>Total Earned</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabBar, { borderColor: colors.borderLight }]}>
          {(['active', 'completed', 'posted'] as Tab[]).map(t => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabBtn,
                tab === t
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === t ? '#fff' : colors.textSecondary },
                ]}
              >
                {t === 'active' ? `Active (${activeGigs.length})`
                  : t === 'completed' ? `Done (${completedGigs.length})`
                    : `Posted (${myPostedGigs.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={gigs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const { label, action } = renderGigAction(item);
          return (
            <GigCard
              gig={item}
              onPress={() => setSelectedGig(item)}
              showPoster
              actionLabel={label}
              onAction={action}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={tab === 'active' ? 'briefcase-outline' : tab === 'completed' ? 'checkmark-done-outline' : 'create-outline'}
            title={
              tab === 'active' ? 'No active jobs'
                : tab === 'completed' ? 'No completed jobs'
                  : 'No posted gigs'
            }
            message={
              tab === 'active' ? 'Browse gigs and accept one to get started.'
                : tab === 'completed' ? 'Jobs you finish will show up here.'
                  : 'Post a gig to find students who can help.'
            }
          />
        }
      />

      <GigDetailModal
        gig={selectedGig}
        visible={!!selectedGig}
        onClose={() => setSelectedGig(null)}
        autoReleaseSeconds={autoReleaseSecs}
        onAccept={undefined}
        onComplete={
          selectedGig?.status === 'accepted'
            && selectedGig?.acceptedById === CURRENT_USER.id
            && selectedGig?.completionStatus !== 'pending_confirmation'
            ? () => { markComplete(selectedGig.id); setSelectedGig(null); }
            : undefined
        }
        onConfirm={
          selectedGig?.posterId === CURRENT_USER.id
            && selectedGig?.completionStatus === 'pending_confirmation'
            && selectedGig?.disputeStatus !== 'disputed'
            ? () => { confirmCompletion(selectedGig.id); setSelectedGig(null); }
            : undefined
        }
        onDispute={
          selectedGig?.posterId === CURRENT_USER.id
            && selectedGig?.completionStatus === 'pending_confirmation'
            && selectedGig?.disputeStatus !== 'disputed'
            ? () => { openDispute(selectedGig.id); setSelectedGig(null); }
            : undefined
        }
      />

      <ReviewModal
        visible={!!reviewGig}
        onClose={() => setReviewGig(null)}
        revieweeName={reviewGig?.posterName ?? ''}
        gigTitle={reviewGig?.title ?? ''}
        onSubmit={(rating, comment) => {
          if (!reviewGig) return;
          submitReview({
            gigId: reviewGig.id,
            reviewerId: CURRENT_USER.id,
            revieweeId: reviewGig.posterName,
            reviewerName: CURRENT_USER.name,
            rating,
            comment,
            gigTitle: reviewGig.title,
          });
          setReviewGig(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  earningCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 12,
    borderRadius: 10,
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  earningLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
