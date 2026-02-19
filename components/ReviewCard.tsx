import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import StarRating from './StarRating';
import type { Review } from '../constants/MockData';

interface ReviewCardProps {
  review: Review;
  showGigTitle?: boolean;
}

export default function ReviewCard({ review, showGigTitle = false }: ReviewCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.reviewer, { color: colors.text }]}>{review.reviewerName}</Text>
          {showGigTitle && (
            <Text style={[styles.gigTitle, { color: colors.textSecondary }]}>{review.gigTitle}</Text>
          )}
        </View>
        <View style={styles.ratingCol}>
          <StarRating rating={review.rating} size={14} />
          <Text style={[styles.date, { color: colors.textSecondary }]}>{review.createdAt}</Text>
        </View>
      </View>
      <Text style={[styles.comment, { color: colors.textTertiary }]}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  reviewer: {
    fontSize: 14,
    fontWeight: '700',
  },
  gigTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  date: {
    fontSize: 11,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
});
