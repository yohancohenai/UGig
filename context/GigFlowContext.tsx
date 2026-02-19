import React, { createContext, useContext, useRef, useMemo, useCallback } from 'react';
import { useUser } from './UserContext';
import { usePayment } from './PaymentContext';
import { useNotification } from './NotificationContext';
import { useWallet } from './WalletContext';
import { CURRENT_USER, PLATFORM_FEE_PERCENT, formatCents } from '../constants/MockData';

interface GigFlowContextValue {
  /** Worker accepts a gig: open → pending, then auto-simulates poster confirm after 3s */
  acceptGig: (gigId: string) => void;
  /** Worker marks gig complete: accepted → completed, releases payment, credits wallet */
  completeGig: (gigId: string) => void;
  /** True while the poster confirmation is being simulated */
  isSimulating: (gigId: string) => boolean;
}

const GigFlowContext = createContext<GigFlowContextValue | null>(null);

export function GigFlowProvider({ children }: { children: React.ReactNode }) {
  const { allGigs, updateGig } = useUser();
  const { createEscrowPayment, releasePayment, getPayment } = usePayment();
  const { addNotification } = useNotification();
  const { creditWallet } = useWallet();
  const simulatingRef = useRef<Set<string>>(new Set());

  const acceptGig = useCallback((gigId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig || gig.status !== 'open') return;

    // Move to pending
    updateGig(gigId, { status: 'pending', acceptedBy: CURRENT_USER.name });

    addNotification({
      type: 'gig_accepted',
      title: 'Gig Accepted!',
      message: `You applied for "${gig.title}". Waiting for ${gig.posterName} to confirm and pay...`,
      gigId,
    });

    // Simulate poster confirmation after 3 seconds
    simulatingRef.current.add(gigId);
    setTimeout(() => {
      simulatingRef.current.delete(gigId);

      // Parse a rough amount from the pay string for the mock payment
      const amountCents = parsePayToCents(gig.pay);
      const payment = createEscrowPayment(gigId, amountCents);

      addNotification({
        type: 'payment_submitted',
        title: 'Payment Submitted',
        message: `${gig.posterName} paid ${formatCents(amountCents)} for "${gig.title}". Funds are held in escrow.`,
        gigId,
      });

      updateGig(gigId, { status: 'accepted', payment });

      addNotification({
        type: 'gig_confirmed',
        title: `${gig.posterName} Confirmed!`,
        message: `"${gig.title}" is confirmed. ${formatCents(amountCents)} is held in escrow. Time to get to work!`,
        gigId,
      });
    }, 3000);
  }, [allGigs, updateGig, createEscrowPayment, addNotification]);

  const completeGig = useCallback((gigId: string) => {
    const gig = allGigs.find(g => g.id === gigId);
    if (!gig || gig.status !== 'accepted') return;

    const payment = gig.payment ?? getPayment(gigId);
    const netPayout = payment?.netPayoutCents ?? 0;

    // Release payment
    if (payment) {
      releasePayment(gig);
    }

    // Move gig to completed
    updateGig(gigId, { status: 'completed' });

    addNotification({
      type: 'gig_completed',
      title: 'Job Completed!',
      message: `You marked "${gig.title}" as complete. Payment is being processed.`,
      gigId,
    });

    // Credit the wallet
    if (netPayout > 0) {
      creditWallet(netPayout, `Payout for "${gig.title}"`, gigId);
    }

    addNotification({
      type: 'payment_released',
      title: 'Payment Released!',
      message: `${formatCents(netPayout)} has been added to your wallet for completing "${gig.title}".`,
      gigId,
    });
  }, [allGigs, updateGig, releasePayment, getPayment, creditWallet, addNotification]);

  const isSimulating = useCallback(
    (gigId: string) => simulatingRef.current.has(gigId),
    []
  );

  const value = useMemo(
    () => ({ acceptGig, completeGig, isSimulating }),
    [acceptGig, completeGig, isSimulating]
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

/** Parse a pay string like "$20/hr", "$50 flat", "$12/walk" to cents */
function parsePayToCents(pay: string): number {
  const match = pay.match(/\$(\d+)/);
  if (!match) return 2000; // fallback $20
  return parseInt(match[1], 10) * 100;
}
