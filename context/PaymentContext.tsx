import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { Gig, Payment, PaymentStatus } from '../constants/MockData';
import { PLATFORM_FEE_PERCENT, formatCents } from '../constants/MockData';

interface PaymentContextValue {
  getPayment: (gigId: string) => Payment | undefined;
  /** Poster funds gig escrow via Stripe — stores paymentIntentId */
  fundGigEscrow: (gigId: string, amountCents: number, paymentIntentId: string) => Payment;
  /** Release escrow (poster confirms or auto-release) */
  releaseEscrow: (gig: Gig) => void;
  /** Refund escrow (dispute resolution) */
  refundEscrow: (gig: Gig) => void;
  /** @deprecated Use fundGigEscrow instead */
  createEscrowPayment: (gigId: string, amountCents: number) => Payment;
  /** @deprecated Use releaseEscrow instead */
  releasePayment: (gig: Gig) => void;
  payments: Payment[];
  totalEarnedCents: number;
  totalEscrowCents: number;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
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
    {
      id: 'pay_3',
      gigId: '15',
      amountCents: 1800,
      serviceFeeCents: 180,
      netPayoutCents: 1620,
      status: 'in_escrow',
      paymentIntentId: 'pi_mock_15',
      createdAt: '2026-02-17',
    },
  ]);

  const getPayment = useCallback(
    (gigId: string) => payments.find(p => p.gigId === gigId),
    [payments]
  );

  const fundGigEscrow = useCallback((gigId: string, amountCents: number, paymentIntentId: string): Payment => {
    const serviceFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);
    const netPayoutCents = amountCents - serviceFeeCents;
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      gigId,
      amountCents,
      serviceFeeCents,
      netPayoutCents,
      status: 'in_escrow',
      paymentIntentId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  }, []);

  const releaseEscrow = useCallback((gig: Gig) => {
    setPayments(prev =>
      prev.map(p =>
        p.gigId === gig.id && p.status === 'in_escrow'
          ? { ...p, status: 'released' as PaymentStatus }
          : p
      )
    );
  }, []);

  const refundEscrow = useCallback((gig: Gig) => {
    setPayments(prev =>
      prev.map(p =>
        p.gigId === gig.id && p.status === 'in_escrow'
          ? { ...p, status: 'refunded' as PaymentStatus }
          : p
      )
    );
  }, []);

  // Legacy methods kept for backward compat
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
    () => ({
      getPayment, fundGigEscrow, releaseEscrow, refundEscrow,
      createEscrowPayment, releasePayment,
      payments, totalEarnedCents, totalEscrowCents,
    }),
    [getPayment, fundGigEscrow, releaseEscrow, refundEscrow,
     createEscrowPayment, releasePayment,
     payments, totalEarnedCents, totalEscrowCents]
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
