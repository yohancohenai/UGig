import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useVerification } from '../context/VerificationContext';

interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EmailVerificationModal({ visible, onClose }: EmailVerificationModalProps) {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const { pendingCode, startEmailVerification, submitEmailCode } = useVerification();
  const [code, setCode] = useState('');

  const isEduEmail = user.email.toLowerCase().endsWith('.edu');
  const codeSent = pendingCode !== null;
  const canSubmit = code.length === 6;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const success = submitEmailCode(code);
    if (success) {
      setCode('');
      onClose();
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Verify Email</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.emailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={32} color={colors.primary} />
            <Text style={[styles.emailText, { color: colors.text }]}>{user.email}</Text>
            <Text style={[styles.emailHint, { color: colors.textSecondary }]}>
              We'll send a verification code to this address
            </Text>
          </View>

          {!isEduEmail && (
            <View style={[styles.warningBox, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
              <Ionicons name="warning-outline" size={18} color="#ef4444" />
              <Text style={[styles.warningText, { color: '#ef4444' }]}>
                Only .edu email addresses are accepted for student verification.
              </Text>
            </View>
          )}

          {!codeSent ? (
            <Pressable
              onPress={startEmailVerification}
              disabled={!isEduEmail}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor: isEduEmail ? colors.primary : colors.borderLight,
                  opacity: pressed && isEduEmail ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons
                name="paper-plane"
                size={18}
                color={isEduEmail ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
              />
              <Text
                style={[
                  styles.sendBtnText,
                  { color: isEduEmail ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
                ]}
              >
                Send Verification Code
              </Text>
            </Pressable>
          ) : (
            <>
              <Text style={[styles.codeLabel, { color: colors.text }]}>
                Enter the 6-digit code
              </Text>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                autoFocus
              />
              <Pressable onPress={startEmailVerification} style={styles.resendRow}>
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Resend code
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {codeSent && (
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
                name="shield-checkmark"
                size={18}
                color={canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
              />
              <Text
                style={[
                  styles.submitBtnText,
                  { color: canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
                ]}
              >
                Verify Code
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { flex: 1, padding: 20 },
  emailCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  emailText: { fontSize: 16, fontWeight: '700' },
  emailHint: { fontSize: 13, textAlign: 'center' },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: { flex: 1, fontSize: 13 },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  sendBtnText: { fontSize: 16, fontWeight: '700' },
  codeLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  codeInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendRow: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 14, fontWeight: '600' },
  footer: { padding: 20, paddingBottom: 36, borderTopWidth: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
});
