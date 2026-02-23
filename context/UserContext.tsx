import React, { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CURRENT_USER, MOCK_GIGS, User, Gig } from '../constants/MockData';
import type { Payment } from '../constants/MockData';
import { College, getCollegeById } from '../constants/Colleges';
import { useTheme } from './ThemeContext';
import { getStoredCollegeId, setStoredCollegeId } from '../utils/storage';

interface UserContextValue {
  user: User;
  college: College | undefined;
  isOnboarded: boolean;
  collegeLoading: boolean;
  allGigs: Gig[];
  campusGigs: Gig[];
  openCampusGigs: Gig[];
  myAcceptedGigs: Gig[];
  myPostedGigs: Gig[];
  selectCollege: (collegeId: string) => Promise<void>;
  resetCollege: () => Promise<void>;
  updateGig: (gigId: string, updates: Partial<Gig>) => void;
  addGig: (gig: Omit<Gig, 'id'>) => string;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { setAccent } = useTheme();
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [collegeLoading, setCollegeLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>(MOCK_GIGS);
  const nextIdRef = useRef(100);

  useEffect(() => {
    (async () => {
      const stored = await getStoredCollegeId();
      if (stored) {
        setCollegeId(stored);
        const c = getCollegeById(stored);
        if (c) setAccent(c.accent);
      }
      setCollegeLoading(false);
    })();
  }, [setAccent]);

  const user: User = useMemo(
    () => collegeId
      ? { ...CURRENT_USER, collegeId, school: getCollegeById(collegeId)?.name ?? CURRENT_USER.school }
      : CURRENT_USER,
    [collegeId]
  );

  const college = useMemo(
    () => collegeId ? getCollegeById(collegeId) : undefined,
    [collegeId]
  );

  const campusGigs = useMemo(
    () => collegeId ? gigs.filter(g => g.collegeId === collegeId) : [],
    [collegeId, gigs]
  );

  const openCampusGigs = useMemo(
    () => campusGigs.filter(g => g.status === 'open'),
    [campusGigs]
  );

  const myAcceptedGigs = useMemo(
    () => gigs.filter(
      g => g.acceptedBy === user.name &&
        (g.status === 'pending' || g.status === 'accepted' || g.status === 'completed')
    ),
    [gigs, user.name]
  );

  const myPostedGigs = useMemo(
    () => gigs.filter(g => g.posterId === user.id),
    [gigs, user.id]
  );

  const updateGig = useCallback((gigId: string, updates: Partial<Gig>) => {
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, ...updates } : g));
  }, []);

  const addGig = useCallback((gig: Omit<Gig, 'id'>): string => {
    const id = String(nextIdRef.current++);
    setGigs(prev => [{ ...gig, id }, ...prev]);
    return id;
  }, []);

  const selectCollege = useCallback(async (id: string) => {
    setCollegeId(id);
    const c = getCollegeById(id);
    if (c) setAccent(c.accent);
    await setStoredCollegeId(id);
  }, [setAccent]);

  const resetCollege = useCallback(async () => {
    setCollegeId(null);
    setAccent(null);
    await setStoredCollegeId(null);
  }, [setAccent]);

  const value = useMemo(
    () => ({
      user,
      college,
      isOnboarded: !!collegeId,
      collegeLoading,
      allGigs: gigs,
      campusGigs,
      openCampusGigs,
      myAcceptedGigs,
      myPostedGigs,
      selectCollege,
      resetCollege,
      updateGig,
      addGig,
    }),
    [user, college, collegeId, collegeLoading, gigs, campusGigs, openCampusGigs, myAcceptedGigs, myPostedGigs, selectCollege, resetCollege, updateGig, addGig]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
