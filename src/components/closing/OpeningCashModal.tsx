import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { formatINR, parseAmount } from '../../utils/currency';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';

interface OpeningCashModalProps {
  visible: boolean;
  currentOpeningCash: number;
  onClose: () => void;
  onSave: (amount: number, reason?: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

export const OpeningCashModal: React.FC<OpeningCashModalProps> = ({
  visible,
  currentOpeningCash,
  onClose,
  onSave,
  isSubmitting = false,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setAmountStr(currentOpeningCash > 0 ? String(currentOpeningCash) : '');
      setReason('');
      setError(null);
    }
  }, [visible, currentOpeningCash]);

  const handleSave = async () => {
    const num = parseAmount(amountStr);
    if (num < 0) {
      setError('Opening cash cannot be negative.');
      return;
    }

    const success = await onSave(num, reason);
    if (success) {
      onClose();
    } else {
      setError('Failed to update opening cash balance.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, SHADOWS.lg]}>
          <Text style={styles.title}>Daily Opening Cash</Text>
          <Text style={styles.subtitle}>
            Set or adjust the starting cash float for today
          </Text>

          <CustomInput
            label="Opening Amount (₹)"
            placeholder="0"
            keyboardType="numeric"
            value={amountStr}
            onChangeText={(txt) => {
              setAmountStr(txt);
              setError(null);
            }}
            prefix="₹"
            isAmountInput
            error={error || undefined}
          />

          <CustomInput
            label="Adjustment Note (Optional)"
            placeholder="e.g. Initial float added from bank"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
          />

          <View style={styles.buttonRow}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.btn}
            />
            <CustomButton
              title="Save Balance"
              variant="primary"
              onPress={handleSave}
              loading={isSubmitting}
              style={[styles.btn, { marginLeft: SPACING.md }]}
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  btn: {
    flex: 1,
  },
});
