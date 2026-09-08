import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';

interface ReopenDayModalProps {
  visible: boolean;
  businessDate: string;
  onClose: () => void;
  onReopen: (reason: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

export const ReopenDayModal: React.FC<ReopenDayModalProps> = ({
  visible,
  businessDate,
  onClose,
  onReopen,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleReopen = async () => {
    if (!reason || reason.trim().length === 0) {
      setError('A reason is strictly mandatory to reopen a closed day.');
      return;
    }

    const success = await onReopen(reason.trim());
    if (success) {
      setReason('');
      onClose();
    } else {
      setError('Failed to reopen day. Only Admins are authorized.');
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
          <Text style={styles.title}>Reopen Business Day</Text>
          <Text style={styles.subtitle}>
            Unlocking date {businessDate} will allow staff to create and edit entries.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Security Warning: This action will be permanently recorded in the company audit log with your Administrator ID.
            </Text>
          </View>

          <CustomInput
            label="Reopen Reason (Mandatory)"
            placeholder="e.g. Audit correction for unrecorded pledge"
            value={reason}
            onChangeText={(txt) => {
              setReason(txt);
              setError(null);
            }}
            multiline
            numberOfLines={3}
            error={error || undefined}
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
              title="Unlock Day"
              variant="danger"
              onPress={handleReopen}
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
    color: PALETTE.cashOut,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  warningBox: {
    backgroundColor: PALETTE.shortLight,
    borderColor: PALETTE.cashOutBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  warningText: {
    fontSize: 12,
    color: PALETTE.cashOut,
    fontWeight: '600',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  btn: {
    flex: 1,
  },
});
