import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useVerification } from '../context/VerificationContext';

interface VerificationBannerProps {
  onVerify: () => void;
}

export default function VerificationBanner({ onVerify }: VerificationBannerProps) {
  const { colors } = useTheme();
  const { isEmailVerified } = useVerification();

  if (isEmailVerified) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
      <Ionicons name="shield-outline" size={20} color={colors.warning} />
      <View style={styles.bannerContent}>
        <Text style={[styles.bannerTitle, { color: colors.warning }]}>Verify Your Email</Text>
        <Text style={[styles.bannerMessage, { color: colors.textSecondary }]}>
          Verify your .edu email to access all features
        </Text>
      </View>
      <Pressable
        onPress={onVerify}
        style={({ pressed }) => [
          styles.verifyBtn,
          { backgroundColor: colors.warning, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.verifyBtnText}>Verify</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannerContent: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerMessage: {
    fontSize: 12,
  },
  verifyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
