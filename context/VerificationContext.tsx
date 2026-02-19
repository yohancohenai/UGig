import React, { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import type { IdVerificationStatus } from '../constants/MockData';
import { useNotification } from './NotificationContext';

interface VerificationContextValue {
  isEmailVerified: boolean;
  idVerificationStatus: IdVerificationStatus;
  pendingCode: string | null;
  startEmailVerification: () => void;
  submitEmailCode: (code: string) => boolean;
  submitIdVerification: () => void;
  canPerformActions: boolean;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [idVerificationStatus, setIdVerificationStatus] = useState<IdVerificationStatus>('none');
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const idTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (idTimerRef.current) clearTimeout(idTimerRef.current);
    };
  }, []);

  const startEmailVerification = useCallback(() => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingCode(code);
    Alert.alert(
      'Check Your Email',
      `Your verification code is: ${code}\n\n(This is a mock — in production this would be emailed to you.)`
    );
  }, []);

  const submitEmailCode = useCallback((code: string): boolean => {
    if (code === pendingCode) {
      setIsEmailVerified(true);
      setPendingCode(null);
      addNotification({
        type: 'verification_complete',
        title: 'Email Verified!',
        message: 'Your .edu email has been verified. You now have the Verified Student badge.',
      });
      return true;
    }
    Alert.alert('Invalid Code', 'The verification code you entered is incorrect. Please try again.');
    return false;
  }, [pendingCode, addNotification]);

  const submitIdVerification = useCallback(() => {
    setIdVerificationStatus('pending');
    addNotification({
      type: 'id_verified',
      title: 'ID Submitted',
      message: 'Your student ID has been submitted for review. You will be notified when it is approved.',
    });

    idTimerRef.current = setTimeout(() => {
      setIdVerificationStatus('approved');
      addNotification({
        type: 'id_verified',
        title: 'ID Verified!',
        message: 'Your student ID has been reviewed and approved. You now have the ID Verified badge.',
      });
    }, 5000);
  }, [addNotification]);

  const canPerformActions = isEmailVerified;

  const value = useMemo(
    () => ({
      isEmailVerified,
      idVerificationStatus,
      pendingCode,
      startEmailVerification,
      submitEmailCode,
      submitIdVerification,
      canPerformActions,
    }),
    [isEmailVerified, idVerificationStatus, pendingCode, startEmailVerification, submitEmailCode, submitIdVerification, canPerformActions]
  );

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error('useVerification must be used within VerificationProvider');
  return ctx;
}
