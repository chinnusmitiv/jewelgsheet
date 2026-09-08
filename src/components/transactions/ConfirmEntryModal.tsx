import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { TransactionType, CashDirection } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import { Badge } from '../common/Badge';
import { CustomButton } from '../common/CustomButton';

interface ConfirmEntryModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  transactionType: TransactionType;
  cashDirection: CashDirection;
  amount: number;
  description?: string;
  reference?: string;
  date: string;
}

export const ConfirmEntryModal: React.FC<ConfirmEntryModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  isSubmitting = false,
  transactionType,
  cashDirection,
  amount,
  description,
  reference,
  date,
}) => {
  const isCashIn = cashDirection === 'CASH_IN';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, SHADOWS.lg]}>
          <Text style={styles.headerTitle}>Confirm Transaction Entry</Text>
          <Text style={styles.headerSubtitle}>
            Please review the details before saving
          </Text>

          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text
              style={[
                styles.amountValue,
                { color: isCashIn ? PALETTE.cashIn : PALETTE.cashOut },
              ]}
            >
              {isCashIn ? '+' : '-'}{formatINR(amount)}
            </Text>
            <View style={styles.badgeRow}>
              <Badge
                label={transactionType.replace(/_/g, ' ')}
                variant="neutral"
                size="md"
              />
              <Badge
                label={cashDirection.replace(/_/g, ' ')}
                variant={isCashIn ? 'cashIn' : 'cashOut'}
                size="md"
                style={{ marginLeft: SPACING.xs }}
              />
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Business Date</Text>
              <Text style={styles.detailValue}>{formatDisplayDate(date)}</Text>
            </View>

            {description ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{description}</Text>
              </View>
            ) : null}

            {reference ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference</Text>
                <Text style={styles.detailValue}>{reference}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              disabled={isSubmitting}
              style={styles.actionBtn}
            />
            <CustomButton
              title="Confirm & Save"
              variant={isCashIn ? 'success' : 'danger'}
              onPress={onConfirm}
              loading={isSubmitting}
              style={[styles.actionBtn, { marginLeft: SPACING.md }]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  amountBox: {
    backgroundColor: PALETTE.surfaceSubtle,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.lg,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '900',
    marginVertical: SPACING.xs,
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  detailsList: {
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: PALETTE.text,
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
  },
});
