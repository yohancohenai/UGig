import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import StarRating from './StarRating';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  revieweeName: string;
  gigTitle: string;
}

export default function ReviewModal({ visible, onClose, onSubmit, revieweeName, gigTitle }: ReviewModalProps) {
  const { colors, isDark } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    if (comment.trim().length === 0) return;
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const canSubmit = rating > 0 && comment.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.bg }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Leave a Review</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={[styles.gigLabel, { color: colors.textSecondary }]}>{gigTitle}</Text>
          <Text style={[styles.revieweeLabel, { color: colors.text }]}>
            How was your experience with {revieweeName}?
          </Text>

          <View style={styles.starSection}>
            <StarRating rating={rating} size={36} interactive onRate={setRating} />
            <Text style={[styles.ratingHint, { color: colors.textSecondary }]}>
              {rating === 0 ? 'Tap a star to rate' : `${rating} out of 5`}
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Write your review..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {comment.length}/500
          </Text>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: canSubmit ? colors.primary : colors.borderLight,
                opacity: pressed && canSubmit ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name="star"
              size={18}
              color={canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
            />
            <Text
              style={[
                styles.submitBtnText,
                { color: canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
              ]}
            >
              Submit Review
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  gigLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  revieweeLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  starSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 12,
  },
  ratingHint: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
