import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { WalletTransaction } from '../constants/MockData';
import { MOCK_WALLET_TRANSACTIONS, formatCents } from '../constants/MockData';

interface WalletContextValue {
  balanceCents: number;
  transactions: WalletTransaction[];
  creditWallet: (amountCents: number, description: string, gigId?: string) => void;
  withdrawFromWallet: (amountCents: number) => boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_WALLET_TRANSACTIONS);

  const balanceCents = useMemo(
    () =>
      transactions.reduce((sum, t) => {
        if (t.type === 'credit') return sum + t.amountCents;
        if (t.type === 'withdrawal') return sum - t.amountCents;
        return sum;
      }, 0),
    [transactions]
  );

  const creditWallet = useCallback(
    (amountCents: number, description: string, gigId?: string) => {
      const txn: WalletTransaction = {
        id: `wt_${Date.now()}`,
        type: 'credit',
        amountCents,
        description,
        gigId,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTransactions(prev => [txn, ...prev]);
    },
    []
  );

  const withdrawFromWallet = useCallback(
    (amountCents: number): boolean => {
      const current = transactions.reduce((sum, t) => {
        if (t.type === 'credit') return sum + t.amountCents;
        if (t.type === 'withdrawal') return sum - t.amountCents;
        return sum;
      }, 0);

      if (amountCents > current) {
        Alert.alert('Insufficient Balance', 'You do not have enough funds to withdraw this amount.');
        return false;
      }
      if (amountCents < 100) {
        Alert.alert('Minimum Withdrawal', 'The minimum withdrawal amount is $1.00.');
        return false;
      }

      const txn: WalletTransaction = {
        id: `wt_${Date.now()}`,
        type: 'withdrawal',
        amountCents,
        description: 'Withdrawal to bank account',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTransactions(prev => [txn, ...prev]);
      Alert.alert(
        'Withdrawal Processed',
        `${formatCents(amountCents)} has been sent to your bank account.`
      );
      return true;
    },
    [transactions]
  );

  const value = useMemo(
    () => ({ balanceCents, transactions, creditWallet, withdrawFromWallet }),
    [balanceCents, transactions, creditWallet, withdrawFromWallet]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
