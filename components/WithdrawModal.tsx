import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { useNotification } from '../context/NotificationContext';
import { formatCents } from '../constants/MockData';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ visible, onClose }: WithdrawModalProps) {
  const { colors, isDark } = useTheme();
  const { balanceCents, withdrawFromWallet } = useWallet();
  const { addNotification } = useNotification();
  const [amount, setAmount] = useState('');

  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const canSubmit = amountCents >= 100 && amountCents <= balanceCents;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const success = withdrawFromWallet(amountCents);
    if (success) {
      addNotification({
        type: 'withdrawal',
        title: 'Withdrawal Processed',
        message: `${formatCents(amountCents)} has been sent to your bank account.`,
      });
      setAmount('');
      onClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const setQuickAmount = (cents: number) => {
    const val = Math.min(cents, balanceCents);
    setAmount((val / 100).toFixed(2));
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Withdraw Funds</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.balanceCard, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.balanceLabel, { color: colors.success }]}>Available Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.success }]}>
              {formatCents(balanceCents)}
            </Text>
          </View>

          <Text style={[styles.inputLabel, { color: colors.text }]}>Withdrawal Amount</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.quickRow}>
            {[500, 1000, 2500].map(cents => (
              <Pressable
                key={cents}
                onPress={() => setQuickAmount(cents)}
                disabled={balanceCents < cents}
                style={[
                  styles.quickBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: balanceCents < cents ? 0.4 : 1,
                  },
                ]}
              >
                <Text style={[styles.quickBtnText, { color: colors.text }]}>
                  {formatCents(cents)}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setQuickAmount(balanceCents)}
              disabled={balanceCents < 100}
              style={[
                styles.quickBtn,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  opacity: balanceCents < 100 ? 0.4 : 1,
                },
              ]}
            >
              <Text style={[styles.quickBtnText, { color: colors.primary }]}>All</Text>
            </Pressable>
          </View>
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
              name="arrow-down-circle"
              size={18}
              color={canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary}
            />
            <Text
              style={[
                styles.submitBtnText,
                { color: canSubmit ? (isDark ? '#0f1117' : '#fff') : colors.textSecondary },
              ]}
            >
              Withdraw {amount ? formatCents(amountCents) : ''}
            </Text>
          </Pressable>
        </View>
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
  balanceCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    marginBottom: 28,
    gap: 4,
  },
  balanceLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { fontSize: 32, fontWeight: '800' },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 4,
    marginBottom: 16,
  },
  dollarSign: { fontSize: 20, fontWeight: '600' },
  input: { flex: 1, fontSize: 20, fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickBtnText: { fontSize: 14, fontWeight: '700' },
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
