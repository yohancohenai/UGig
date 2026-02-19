import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { Gig, Payment, PaymentStatus } from '../constants/MockData';
import { PLATFORM_FEE_PERCENT, formatCents } from '../constants/MockData';

interface PaymentContextValue {
  /** Get the payment for a gig (from mock state) */
  getPayment: (gigId: string) => Payment | undefined;
  /** Poster submits payment → moves to in_escrow (shows Alert) */
  submitPayment: (gig: Gig, amountCents: number) => void;
  /** Create escrow payment silently (no Alert, for programmatic use) */
  createEscrowPayment: (gigId: string, amountCents: number) => Payment;
  /** Poster marks gig complete → releases payment */
  releasePayment: (gig: Gig) => void;
  /** All mock payments */
  payments: Payment[];
  /** Total earned (released) in cents */
  totalEarnedCents: number;
  /** Total in escrow in cents */
  totalEscrowCents: number;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  // Seed with mock payments from accepted/completed gigs
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'pay_1',
      gigId: '6',
      amountCents: 1200,
      serviceFeeCents: 120,
      netPayoutCents: 1080,
      status: 'in_escrow',
      createdAt: '2026-02-10',
    },
    {
      id: 'pay_2',
      gigId: '7',
      amountCents: 3000,
      serviceFeeCents: 300,
      netPayoutCents: 2700,
      status: 'released',
      createdAt: '2026-02-08',
    },
  ]);

  const getPayment = useCallback(
    (gigId: string) => payments.find(p => p.gigId === gigId),
    [payments]
  );

  const createEscrowPayment = useCallback((gigId: string, amountCents: number): Payment => {
    const serviceFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);
    const netPayoutCents = amountCents - serviceFeeCents;
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      gigId,
      amountCents,
      serviceFeeCents,
      netPayoutCents,
      status: 'in_escrow',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  }, []);

  const submitPayment = useCallback((gig: Gig, amountCents: number) => {
    const serviceFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);
    const netPayoutCents = amountCents - serviceFeeCents;
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      gigId: gig.id,
      amountCents,
      serviceFeeCents,
      netPayoutCents,
      status: 'in_escrow',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [...prev, newPayment]);
    Alert.alert(
      'Payment Submitted',
      `${formatCents(amountCents)} is now held in escrow. It will be released when you mark the job as complete.`
    );
  }, []);

  const releasePayment = useCallback((gig: Gig) => {
    setPayments(prev =>
      prev.map(p =>
        p.gigId === gig.id && p.status === 'in_escrow'
          ? { ...p, status: 'released' as PaymentStatus }
          : p
      )
    );
    const payment = payments.find(p => p.gigId === gig.id);
    const payout = payment ? formatCents(payment.netPayoutCents) : '';
    Alert.alert(
      'Payment Released',
      `${payout} has been released to ${gig.acceptedBy ?? 'the worker'} (minus ${PLATFORM_FEE_PERCENT}% platform fee).`
    );
  }, [payments]);

  const totalEarnedCents = useMemo(
    () => payments.filter(p => p.status === 'released').reduce((sum, p) => sum + p.netPayoutCents, 0),
    [payments]
  );

  const totalEscrowCents = useMemo(
    () => payments.filter(p => p.status === 'in_escrow').reduce((sum, p) => sum + p.netPayoutCents, 0),
    [payments]
  );

  const value = useMemo(
    () => ({ getPayment, submitPayment, createEscrowPayment, releasePayment, payments, totalEarnedCents, totalEscrowCents }),
    [getPayment, submitPayment, createEscrowPayment, releasePayment, payments, totalEarnedCents, totalEscrowCents]
  );

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment must be used within PaymentProvider');
  return ctx;
}
