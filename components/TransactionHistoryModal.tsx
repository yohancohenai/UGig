import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { formatCents } from '../constants/MockData';

interface TransactionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransactionHistoryModal({ visible, onClose }: TransactionHistoryModalProps) {
  const { colors } = useTheme();
  const { transactions, balanceCents } = useWallet();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.balanceBanner, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.balanceLabel, { color: colors.primary }]}>Current Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.primary }]}>
            {formatCents(balanceCents)}
          </Text>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.map(txn => {
              const isCredit = txn.type === 'credit';
              return (
                <View
                  key={txn.id}
                  style={[styles.txnRow, { borderBottomColor: colors.border }]}
                >
                  <View style={[styles.txnIcon, { backgroundColor: isCredit ? colors.successLight : '#fef2f2' }]}>
                    <Ionicons
                      name={isCredit ? 'arrow-up-circle' : 'arrow-down-circle'}
                      size={20}
                      color={isCredit ? colors.success : '#ef4444'}
                    />
                  </View>
                  <View style={styles.txnContent}>
                    <Text style={[styles.txnDesc, { color: colors.text }]}>{txn.description}</Text>
                    <Text style={[styles.txnDate, { color: colors.textSecondary }]}>{txn.createdAt}</Text>
                  </View>
                  <Text
                    style={[
                      styles.txnAmount,
                      { color: isCredit ? colors.success : '#ef4444' },
                    ]}
                  >
                    {isCredit ? '+' : '-'}{formatCents(txn.amountCents)}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
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
  balanceBanner: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  balanceLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { fontSize: 24, fontWeight: '800' },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 40 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnContent: { flex: 1, gap: 2 },
  txnDesc: { fontSize: 14, fontWeight: '600' },
  txnDate: { fontSize: 12 },
  txnAmount: { fontSize: 15, fontWeight: '700' },
});
