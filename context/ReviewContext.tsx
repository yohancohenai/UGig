import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { Review } from '../constants/MockData';
import { MOCK_REVIEWS } from '../constants/MockData';

interface ReviewContextValue {
  reviews: Review[];
  getReviewsForUser: (userId: string) => Review[];
  getReviewsForGig: (gigId: string) => Review[];
  hasReviewed: (gigId: string, reviewerId: string) => boolean;
  submitReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  getAverageRating: (userId: string) => number;
  getReviewCount: (userId: string) => number;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);

  const getReviewsForUser = useCallback(
    (userId: string) => reviews.filter(r => r.revieweeId === userId),
    [reviews]
  );

  const getReviewsForGig = useCallback(
    (gigId: string) => reviews.filter(r => r.gigId === gigId),
    [reviews]
  );

  const hasReviewed = useCallback(
    (gigId: string, reviewerId: string) =>
      reviews.some(r => r.gigId === gigId && r.reviewerId === reviewerId),
    [reviews]
  );

  const submitReview = useCallback((review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReviews(prev => [...prev, newReview]);
    Alert.alert('Review Submitted', 'Thanks for your feedback!');
  }, []);

  const getAverageRating = useCallback(
    (userId: string) => {
      const userReviews = reviews.filter(r => r.revieweeId === userId);
      if (userReviews.length === 0) return 0;
      return userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    },
    [reviews]
  );

  const getReviewCount = useCallback(
    (userId: string) => reviews.filter(r => r.revieweeId === userId).length,
    [reviews]
  );

  const value = useMemo(
    () => ({
      reviews,
      getReviewsForUser,
      getReviewsForGig,
      hasReviewed,
      submitReview,
      getAverageRating,
      getReviewCount,
    }),
    [reviews, getReviewsForUser, getReviewsForGig, hasReviewed, submitReview, getAverageRating, getReviewCount]
  );

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReview must be used within ReviewProvider');
  return ctx;
}
