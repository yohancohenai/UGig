import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { usePayment } from '../../context/PaymentContext';
import { useNotification } from '../../context/NotificationContext';
import { useVerification } from '../../context/VerificationContext';
import { useStripePayment } from '../../hooks/useStripePayment';
import { parsePayToCents, formatCents } from '../../constants/MockData';
import VerificationBanner from '../../components/VerificationBanner';

export default function PostGigScreen() {
  const { colors, isDark } = useTheme();
  const { college, user, addGig, updateGig } = useUser();
  const { fundGigEscrow } = usePayment();
  const { addNotification } = useNotification();
  const { canPerformActions } = useVerification();
  const { pay: stripePay, loading: stripeLoading } = useStripePayment();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');

  const canSubmit = title.trim() && description.trim() && pay.trim() && location.trim();
  const amountCents = pay.trim() ? parsePayToCents(pay) : 0;

  const handleSubmit = async () => {
    if (!canSubmit || !college || stripeLoading) return;
    if (!canPerformActions) {
      Alert.alert(
        'Verification Required',
        'Please verify your .edu email in Settings before posting gigs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/(tabs)/settings') },
        ]
      );
      return;
    }

    // 1. Stripe payment — poster must pay before gig is published
    const result = await stripePay({
      gigId: `new_${Date.now()}`,
      amountCents,
      posterId: user.id,
    });
    if (!result.success || !result.paymentIntentId) return;

    // 2. Create the gig with escrow data
    const gigId = addGig({
      collegeId: college.id,
      title: title.trim(),
      description: description.trim(),
      pay: pay.trim(),
      location: location.trim(),
      status: 'open',
      posterName: user.name,
      posterId: user.id,
      posterSchool: college.name,
      escrowStatus: 'in_escrow',
      paymentIntentId: result.paymentIntentId,
      completionStatus: 'not_started',
      disputeStatus: 'none',
      createdAt: new Date().toISOString().split('T')[0],
    });

    // 3. Register payment and attach to gig
    const payment = fundGigEscrow(gigId, amountCents, result.paymentIntentId);
    updateGig(gigId, { payment });

    addNotification({
      type: 'new_gig',
      title: 'New Gig Posted!',
      message: `Your gig "${title.trim()}" has been posted to ${college.name}. ${formatCents(amountCents)} is held in escrow.`,
      gigId,
    });

    Alert.alert(
      'Gig Posted!',
      `"${title}" has been posted to ${college.name}. ${formatCents(amountCents)} is held in escrow until the job is completed.`,
      [{
        text: 'OK',
        onPress: () => {
          setTitle('');
          setDescription('');
          setPay('');
          setLocation('');
        },
      }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Post a New Gig</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Describe the job so students know what to expect
          </Text>
        </View>

        <VerificationBanner onVerify={() => router.push('/(tabs)/settings')} />

        {/* Campus badge */}
        {college && (
          <View style={[styles.campusBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Ionicons name="school" size={15} color={colors.primary} />
            <Text style={[styles.campusBadgeText, { color: colors.primary }]}>
              Posting to {college.name}
            </Text>
          </View>
        )}

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textTertiary }]}>Gig Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.borderLight, color: colors.text }]}
              placeholder="e.g. Help move furniture"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textTertiary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.borderLight, color: colors.text }]}
              placeholder="What does the job involve? Include details like time commitment, requirements, etc."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Pay & Location */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Pay</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.borderLight, color: colors.text }]}
                placeholder="e.g. $15/hr"
                placeholderTextColor={colors.textSecondary}
                value={pay}
                onChangeText={setPay}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.borderLight, color: colors.text }]}
                placeholder="e.g. Dorm Hall B"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </View>

        {/* Preview */}
        {canSubmit && (
          <View style={styles.previewSection}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Preview</Text>
            <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.previewDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                {description}
              </Text>
              <View style={styles.previewMeta}>
                <View style={styles.previewMetaItem}>
                  <Ionicons name="cash-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.previewMetaText, { color: colors.textSecondary }]}>{pay}</Text>
                </View>
                <View style={styles.previewMetaItem}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.previewMetaText, { color: colors.textSecondary }]}>{location}</Text>
                </View>
                {college && (
                  <View style={styles.previewMetaItem}>
                    <Ionicons name="school-outline" size={13} color={colors.textSecondary} />
                    <Text style={[styles.previewMetaText, { color: colors.textSecondary }]}>{college.shortName}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || stripeLoading}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.primary : colors.borderLight,
              opacity: (pressed && canSubmit && !stripeLoading) ? 0.85 : stripeLoading ? 0.6 : 1,
            },
          ]}
        >
          {stripeLoading ? (
            <ActivityIndicator size="small" color={isDark ? '#0f1117' : '#fff'} />
          ) : (
            <Ionicons
              name="card-outline"
              size={18}
              color={canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
            />
          )}
          <Text
            style={[
              styles.submitBtnText,
              { color: canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
            ]}
          >
            {stripeLoading
              ? 'Processing...'
              : canSubmit && amountCents > 0
                ? `Post & Pay — ${formatCents(amountCents)}`
                : 'Post Gig'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 16,
  },
  campusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  previewMeta: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  previewMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewMetaText: {
    fontSize: 12,
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
