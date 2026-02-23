import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  getAuthSession,
  setAuthSession,
  StoredSession,
  resetAllStorage,
  getOnboardingComplete,
  setOnboardingComplete,
} from '../utils/storage';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: StoredSession | null;
  onboardingComplete: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [onboardingComplete, setOnboardingState] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedSession, storedOnboarding] = await Promise.all([
        getAuthSession(),
        getOnboardingComplete(),
      ]);
      if (storedSession) setSession(storedSession);
      setOnboardingState(storedOnboarding);
      setIsLoading(false);
    })();
  }, []);

  const signUp = useCallback(async (email: string, _password: string, name: string) => {
    const newSession: StoredSession = {
      userId: Date.now().toString(),
      email,
      name,
    };
    await setAuthSession(newSession);
    setSession(newSession);
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    const newSession: StoredSession = {
      userId: '1',
      email,
      name: 'Jordan Rivera',
    };
    await setAuthSession(newSession);
    setSession(newSession);
  }, []);

  const signOut = useCallback(async () => {
    await setAuthSession(null);
    setSession(null);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingComplete(true);
    setOnboardingState(true);
  }, []);

  const resetAll = useCallback(async () => {
    await resetAllStorage();
    setSession(null);
    setOnboardingState(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!session,
      session,
      onboardingComplete,
      signUp,
      signIn,
      signOut,
      completeOnboarding,
      resetAll,
    }),
    [isLoading, session, onboardingComplete, signUp, signIn, signOut, completeOnboarding, resetAll]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
