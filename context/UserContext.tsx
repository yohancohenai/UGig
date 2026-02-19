import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { CURRENT_USER, MOCK_GIGS, User, Gig } from '../constants/MockData';
import type { Payment } from '../constants/MockData';
import { College, getCollegeById } from '../constants/Colleges';

interface UserContextValue {
  user: User;
  college: College | undefined;
  isOnboarded: boolean;
  /** All gigs (mutable state) */
  allGigs: Gig[];
  /** All gigs scoped to the user's college */
  campusGigs: Gig[];
  /** Open gigs on the user's campus */
  openCampusGigs: Gig[];
  /** Gigs the current user has accepted/pending/completed */
  myAcceptedGigs: Gig[];
  selectCollege: (collegeId: string) => void;
  resetCollege: () => void;
  /** Update a gig's fields in state */
  updateGig: (gigId: string, updates: Partial<Gig>) => void;
  /** Add a new gig to state, returns the generated ID */
  addGig: (gig: Omit<Gig, 'id'>) => string;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [gigs, setGigs] = useState<Gig[]>(MOCK_GIGS);
  const nextIdRef = useRef(100);

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

  const updateGig = useCallback((gigId: string, updates: Partial<Gig>) => {
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, ...updates } : g));
  }, []);

  const addGig = useCallback((gig: Omit<Gig, 'id'>): string => {
    const id = String(nextIdRef.current++);
    setGigs(prev => [{ ...gig, id }, ...prev]);
    return id;
  }, []);

  const selectCollege = useCallback((id: string) => setCollegeId(id), []);
  const resetCollege = useCallback(() => setCollegeId(null), []);

  const value = useMemo(
    () => ({
      user,
      college,
      isOnboarded: !!collegeId,
      allGigs: gigs,
      campusGigs,
      openCampusGigs,
      myAcceptedGigs,
      selectCollege,
      resetCollege,
      updateGig,
      addGig,
    }),
    [user, college, collegeId, gigs, campusGigs, openCampusGigs, myAcceptedGigs, selectCollege, resetCollege, updateGig, addGig]
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
