import React, { createContext, useContext, useRef, useMemo, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
import { usePayment } from './PaymentContext';
import { useNotification } from './NotificationContext';
import { useWallet } from './WalletContext';
import { CURRENT_USER, formatCents, parsePayToCents } from '../constants/MockData';

interface GigFlowContextValue {
  /** Worker accepts a gig: open → accepted (escrow already funded at posting) */
  acceptGig: (gigId: string) => void;
  /** Poster funds escrow (called after Stripe payment succeeds) */
  fundGig: (gigId: string, amountCents: number, paymentIntentId: string) => void;
  /** Worker marks gig complete: sets completionStatus to pending_confirmation */
  markComplete: (gigId: string) => void;
  /** Poster confirms completion: releases escrow, credits wallet */
  confirmCompletion: (gigId: string) => void;
  /** Poster opens a dispute: pauses auto-release */
  openDispute: (gigId: string) => void;
  /** Seconds remaining for auto-release timer (null if no timer) */
  getAutoReleaseRemaining: (gigId: string) => number | null;
}

const GigFlowContext = createContext<GigFlowContextValue | null>(null);

/** In dev, auto-release fires after 30 seconds. In production, 48 hours. */
const AUTO_RELEASE_MS = __DEV__ ? 30_000 : 48 * 60 * 60 * 1000;

export function GigFlowProvider({ children }: { children: React.ReactNode }) {
  const { allGigs, updateGig } = useUser();
  const { fundGigEscrow, releaseEscrow, getPayment } = usePayment();
  const { addNotification } = useNotification();
  const { creditWallet } = useWallet();

  const autoReleaseTimers = useRef<Map<string, { timerId: ReturnType<typeof setTimeout>; expiresAt: number }>>(new Map());

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      autoReleaseTimers.current.forEach(({ timerId }) => clearTimeout(timerId));
      autoReleaseTimers.current.clear();
    };
  }, []);

  // ── confirmCompletion (defined first so markComplete can reference it) ──

  const confirmCompletion = useCallback((gigId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig) return;

    const payment = gig.payment ?? getPayment(gigId);
    const netPayout = payment?.netPayoutCents ?? 0;

    // Release escrow
    if (payment) {
      releaseEscrow(gig);
    }

    // Update gig state
    updateGig(gigId, {
      status: 'completed',
      escrowStatus: 'released',
      completionStatus: 'confirmed',
    });

    // Cancel auto-release timer if running
    const timer = autoReleaseTimers.current.get(gigId);
    if (timer) {
      clearTimeout(timer.timerId);
      autoReleaseTimers.current.delete(gigId);
    }

    // Credit worker wallet
    if (netPayout > 0) {
      creditWallet(netPayout, `Payout for "${gig.title}"`, gigId);
    }

    addNotification({
      type: 'completion_confirmed',
      title: 'Completion Confirmed!',
      message: `${formatCents(netPayout)} has been released for "${gig.title}".`,
      gigId,
    });
  }, [allGigs, updateGig, releaseEscrow, getPayment, creditWallet, addNotification]);

  // ── fundGig ──

  const fundGig = useCallback((gigId: string, amountCents: number, paymentIntentId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig) return;

    const payment = fundGigEscrow(gig.id, amountCents, paymentIntentId);

    updateGig(gigId, {
      status: 'accepted',
      escrowStatus: 'in_escrow',
      paymentIntentId,
      payment,
    });

    addNotification({
      type: 'gig_funded',
      title: 'Gig Funded!',
      message: `${formatCents(amountCents)} is held in escrow for "${gig.title}".`,
      gigId,
    });
  }, [allGigs, updateGig, fundGigEscrow, addNotification]);

  // ── acceptGig ──

  const acceptGig = useCallback((gigId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig || gig.status !== 'open') return;

    // Escrow is already funded at posting time — go directly to accepted
    updateGig(gigId, {
      status: 'accepted',
      acceptedBy: CURRENT_USER.name,
      acceptedById: CURRENT_USER.id,
      completionStatus: 'not_started',
      disputeStatus: 'none',
    });

    addNotification({
      type: 'gig_accepted',
      title: 'Gig Accepted!',
      message: `You accepted "${gig.title}". Funds are held in escrow — start working!`,
      gigId,
    });
  }, [allGigs, updateGig, addNotification]);

  // ── markComplete ──

  const markComplete = useCallback((gigId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig || gig.status !== 'accepted') return;

    updateGig(gigId, { completionStatus: 'pending_confirmation' });

    addNotification({
      type: 'completion_requested',
      title: 'Completion Submitted',
      message: `You marked "${gig.title}" as complete. Waiting for ${gig.posterName} to confirm.`,
      gigId,
    });

    // Start auto-release timer
    const timerId = setTimeout(() => {
      autoReleaseTimers.current.delete(gigId);
      // Check if gig is still pending confirmation and not disputed
      const currentGig = allGigs.find(g => g.id === gigId);
      if (currentGig && currentGig.disputeStatus !== 'disputed' && currentGig.completionStatus === 'pending_confirmation') {
        confirmCompletion(gigId);
        addNotification({
          type: 'auto_released',
          title: 'Payment Auto-Released',
          message: `Payment for "${gig.title}" was automatically released after the confirmation window expired.`,
          gigId,
        });
      }
    }, AUTO_RELEASE_MS);

    autoReleaseTimers.current.set(gigId, {
      timerId,
      expiresAt: Date.now() + AUTO_RELEASE_MS,
    });
  }, [allGigs, updateGig, addNotification, confirmCompletion]);

  // ── openDispute ──

  const openDispute = useCallback((gigId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig) return;

    // Cancel auto-release timer
    const timer = autoReleaseTimers.current.get(gigId);
    if (timer) {
      clearTimeout(timer.timerId);
      autoReleaseTimers.current.delete(gigId);
    }

    updateGig(gigId, { disputeStatus: 'disputed' });

    addNotification({
      type: 'dispute_opened',
      title: 'Dispute Opened',
      message: `A dispute has been opened for "${gig.title}". Auto-release has been paused.`,
      gigId,
    });
  }, [allGigs, updateGig, addNotification]);

  // ── getAutoReleaseRemaining ──

  const getAutoReleaseRemaining = useCallback((gigId: string): number | null => {
    const timer = autoReleaseTimers.current.get(gigId);
    if (!timer) return null;
    return Math.max(0, Math.ceil((timer.expiresAt - Date.now()) / 1000));
  }, []);

  const value = useMemo(
    () => ({ acceptGig, fundGig, markComplete, confirmCompletion, openDispute, getAutoReleaseRemaining }),
    [acceptGig, fundGig, markComplete, confirmCompletion, openDispute, getAutoReleaseRemaining]
  );

  return (
    <GigFlowContext.Provider value={value}>
      {children}
    </GigFlowContext.Provider>
  );
}

export function useGigFlow() {
  const ctx = useContext(GigFlowContext);
  if (!ctx) throw new Error('useGigFlow must be used within GigFlowProvider');
  return ctx;
}

