import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useWallet } from '../../context/WalletContext';
import { useReview } from '../../context/ReviewContext';
import { useVerification } from '../../context/VerificationContext';
import { formatCents, CURRENT_USER } from '../../constants/MockData';
import StarRating from '../../components/StarRating';
import WithdrawModal from '../../components/WithdrawModal';
import TransactionHistoryModal from '../../components/TransactionHistoryModal';
import EmailVerificationModal from '../../components/EmailVerificationModal';
import IdVerificationModal from '../../components/IdVerificationModal';

export default function SettingsScreen() {
  const { colors, isDark, mode, toggle, setMode } = useTheme();
  const { user, college, resetCollege } = useUser();
  const { balanceCents } = useWallet();
  const { getAverageRating, getReviewCount } = useReview();
  const { isEmailVerified, idVerificationStatus } = useVerification();
  const router = useRouter();
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [emailVerifyVisible, setEmailVerifyVisible] = useState(false);
  const [idVerifyVisible, setIdVerifyVisible] = useState(false);

  const avgRating = getAverageRating(CURRENT_USER.id);
  const reviewCount = getReviewCount(CURRENT_USER.id);

  const handleThemeCycle = () => {
    if (mode === 'system') setMode('dark');
    else if (mode === 'dark') setMode('light');
    else setMode('system');
  };

  const themeLabel = mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light';

  const handleChangeSchool = () => {
    Alert.alert(
      'Change Campus',
      'This will take you back to the campus selection screen. Your data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => {
            resetCollege();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const comingSoon = () => Alert.alert('Coming Soon', 'This feature is not available yet.');

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user.email}</Text>
          {reviewCount > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={avgRating} size={14} />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
              </Text>
            </View>
          )}
          <View style={styles.profileBadges}>
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                {user.role === 'worker' ? 'Student Worker' : 'Job Poster'}
              </Text>
            </View>
            {college && (
              <View style={[styles.roleBadge, { backgroundColor: colors.successLight }]}>
                <Ionicons name="school" size={10} color={colors.success} />
                <Text style={[styles.roleBadgeText, { color: colors.success }]}>
                  {college.shortName}
                </Text>
              </View>
            )}
            {isEmailVerified && (
              <View style={[styles.roleBadge, { backgroundColor: colors.successLight }]}>
                <Ionicons name="shield-checkmark" size={10} color={colors.success} />
                <Text style={[styles.roleBadgeText, { color: colors.success }]}>Verified Student</Text>
              </View>
            )}
            {idVerificationStatus === 'approved' && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="id-card" size={10} color={colors.primary} />
                <Text style={[styles.roleBadgeText, { color: colors.primary }]}>ID Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Verification */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Verification</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          onPress={() => !isEmailVerified && setEmailVerifyVisible(true)}
          style={styles.settingRow}
        >
          <View style={styles.settingLabel}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Email Verification</Text>
          </View>
          {isEmailVerified ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={[styles.roleBadgeText, { color: colors.success }]}>Verified</Text>
            </View>
          ) : (
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.warning }]}>Not Verified</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          )}
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={() => isEmailVerified && idVerificationStatus === 'none' && setIdVerifyVisible(true)}
          style={styles.settingRow}
        >
          <View style={styles.settingLabel}>
            <Ionicons name="id-card-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Student ID</Text>
          </View>
          {idVerificationStatus === 'approved' ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={[styles.roleBadgeText, { color: colors.success }]}>Verified</Text>
            </View>
          ) : idVerificationStatus === 'pending' ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="hourglass-outline" size={12} color={colors.warning} />
              <Text style={[styles.roleBadgeText, { color: colors.warning }]}>Under Review</Text>
            </View>
          ) : (
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>Optional</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          )}
        </Pressable>
      </View>

      {/* Wallet */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Wallet</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Balance</Text>
          </View>
          <Text style={[styles.walletAmount, { color: colors.success }]}>
            {formatCents(balanceCents)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable onPress={() => setWithdrawVisible(true)} style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="arrow-down-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Withdraw Funds</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable onPress={() => setHistoryVisible(true)} style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Transaction History</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{ false: colors.borderLight, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable onPress={handleThemeCycle} style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Theme</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>{themeLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
      </View>

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SettingLink icon="person-outline" label="Edit Profile" onPress={comingSoon} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable onPress={handleChangeSchool} style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="school-outline" size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Change Campus</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>
              {college?.shortName ?? 'None'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingLink icon="notifications-outline" label="Notifications" onPress={comingSoon} />
      </View>

      {/* Support */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SettingLink icon="help-circle-outline" label="Help Center" onPress={comingSoon} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingLink icon="shield-checkmark-outline" label="Privacy Policy" onPress={comingSoon} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingLink icon="document-text-outline" label="Terms of Service" onPress={comingSoon} />
      </View>

      {/* Sign Out */}
      <Pressable
        onPress={() => Alert.alert('Signed Out', 'You have been signed out.')}
        style={({ pressed }) => [
          styles.signOutBtn,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.textSecondary }]}>UGig v1.0.0 · Expo SDK 54</Text>

      <WithdrawModal visible={withdrawVisible} onClose={() => setWithdrawVisible(false)} />
      <TransactionHistoryModal visible={historyVisible} onClose={() => setHistoryVisible(false)} />
      <EmailVerificationModal visible={emailVerifyVisible} onClose={() => setEmailVerifyVisible(false)} />
      <IdVerificationModal visible={idVerifyVisible} onClose={() => setIdVerifyVisible(false)} />
    </ScrollView>
  );
}

function SettingLink({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={[styles.settingText, { color: colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
  },
  walletAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
  },
});
