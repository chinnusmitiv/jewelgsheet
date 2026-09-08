import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { apiRequest } from '../../services/api/apiClient';
import { formatINR, parseAmount } from '../../utils/currency';
import { formatDisplayDate, formatDisplayTime } from '../../utils/date';
import { Badge } from '../../components/common/Badge';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';

export const EntryDetailsScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { transactionId } = route.params;
  const { user } = useAuth();
  const { updateTransaction, voidTransaction, isSubmitting } = useFinancial();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editAmountStr, setEditAmountStr] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editReference, setEditReference] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  // Void/Delete Modal State
  const [showVoidModal, setShowVoidModal] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>('');
  const [voidError, setVoidError] = useState<string | null>(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    const res = await apiRequest<Transaction>('getTransaction', { transactionId });
    if (res.success && res.data) {
      setTransaction(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();
  }, [transactionId]);

  const openEditModal = () => {
    if (!transaction) return;
    setEditAmountStr(String(transaction.amount));
    setEditDescription(transaction.description || '');
    setEditReference(transaction.reference || '');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const num = parseAmount(editAmountStr);
    if (!num || num <= 0) {
      setEditError('Amount must be greater than ₹0.');
      return;
    }

    const res = await updateTransaction(transactionId, {
      amount: num,
      description: editDescription.trim(),
      reference: editReference.trim(),
    });

    if (res.success) {
      setShowEditModal(false);
      Alert.alert('Entry Updated', 'The transaction has been successfully updated and balances recalculated.');
      fetchDetails();
    } else {
      setEditError(res.message || 'Failed to update transaction.');
    }
  };

  const handleVoid = async () => {
    if (!voidReason || voidReason.trim().length === 0) {
      setVoidError('A reason is mandatory to void/delete this entry.');
      return;
    }

    const res = await voidTransaction(transactionId, voidReason.trim());
    if (res.success) {
      setShowVoidModal(false);
      Alert.alert('Entry Voided', 'This entry has been marked as VOIDED, removed from daily cash totals, and logged in audit history.');
      fetchDetails();
    } else {
      setVoidError(res.message || 'Failed to void transaction.');
    }
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading entry details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCashIn = transaction.cashDirection === 'CASH_IN';
  const isVoided = transaction.status === 'VOIDED';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Card */}
        <View style={[styles.headerCard, SHADOWS.md]}>
          <View style={styles.topStatusRow}>
            <Badge
              label={transaction.companyId + ' Branch'}
              variant="neutral"
              size="sm"
            />
            <Badge
              label={isVoided ? 'VOIDED (DELETED)' : 'ACTIVE'}
              variant={isVoided ? 'voided' : isCashIn ? 'cashIn' : 'cashOut'}
              size="md"
            />
          </View>

          <Text
            style={[
              styles.amountText,
              { color: isVoided ? PALETTE.textMuted : isCashIn ? PALETTE.cashIn : PALETTE.cashOut },
              isVoided && styles.strikethrough,
            ]}
          >
            {isCashIn ? '+' : '-'}{formatINR(transaction.amount)}
          </Text>

          <Text style={styles.typeText}>
            {transaction.transactionType.replace(/_/g, ' ')}
          </Text>
        </View>

        {/* Void Notice if applicable */}
        {isVoided && (
          <View style={styles.voidNoticeBox}>
            <Text style={styles.voidNoticeTitle}>⚠️ Voided / Deleted Transaction</Text>
            <Text style={styles.voidNoticeReason}>
              Reason: {transaction.voidReason || 'No reason specified'}
            </Text>
            <Text style={styles.voidNoticeMeta}>
              Voided By: {transaction.voidedBy} at{' '}
              {formatDisplayTime(transaction.voidedAt)}
            </Text>
          </View>
        )}

        {/* Detailed Fields List */}
        <View style={[styles.detailsCard, SHADOWS.sm]}>
          <Text style={styles.sectionHeading}>Transaction Information</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Entry ID</Text>
            <Text style={styles.fieldValueBold}>{transaction.transactionId}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Business Date</Text>
            <Text style={styles.fieldValue}>
              {formatDisplayDate(transaction.transactionDate)}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Time</Text>
            <Text style={styles.fieldValue}>
              {formatDisplayTime(transaction.transactionTime || transaction.createdAt)}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Cash Direction</Text>
            <Text
              style={[
                styles.fieldValueBold,
                { color: isCashIn ? PALETTE.cashIn : PALETTE.cashOut },
              ]}
            >
              {transaction.cashDirection.replace('_', ' ')}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Entered By</Text>
            <Text style={styles.fieldValue}>
              {transaction.createdByName || transaction.createdBy}
            </Text>
          </View>

          {transaction.reference ? (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Reference #</Text>
              <Text style={styles.fieldValue}>{transaction.reference}</Text>
            </View>
          ) : null}

          {transaction.description ? (
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Description / Notes</Text>
              <Text style={styles.descriptionText}>{transaction.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons: Edit & Delete/Void */}
        {!isVoided && isAdmin && (
          <View style={styles.actionButtonsContainer}>
            <CustomButton
              title="✏️ Edit Entry"
              variant="primary"
              size="lg"
              onPress={openEditModal}
              style={styles.actionBtn}
            />
            <CustomButton
              title="🗑️ Delete / Void Entry"
              variant="danger"
              size="lg"
              onPress={() => {
                setVoidReason('');
                setVoidError(null);
                setShowVoidModal(true);
              }}
              style={[styles.actionBtn, { marginTop: SPACING.sm }]}
            />
          </View>
        )}
      </ScrollView>

      {/* Edit Entry Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, SHADOWS.lg]}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            <Text style={styles.modalSubtitle}>
              Modify entry amount or remarks for {transaction.transactionId}
            </Text>

            <CustomInput
              label="Transaction Amount (₹)"
              placeholder="0"
              keyboardType="numeric"
              value={editAmountStr}
              onChangeText={(txt) => {
                setEditAmountStr(txt);
                setEditError(null);
              }}
              prefix="₹"
              isAmountInput
              error={editError || undefined}
            />

            <CustomInput
              label="Description / Remarks"
              placeholder="e.g. Updated note"
              value={editDescription}
              onChangeText={setEditDescription}
            />

            <CustomInput
              label="Reference # (Optional)"
              placeholder="e.g. REF-001"
              value={editReference}
              onChangeText={setEditReference}
            />

            <View style={styles.modalButtonRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowEditModal(false)}
                disabled={isSubmitting}
                style={styles.modalBtn}
              />
              <CustomButton
                title="Save Changes"
                variant="primary"
                onPress={handleSaveEdit}
                loading={isSubmitting}
                style={[styles.modalBtn, { marginLeft: SPACING.md }]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete / Void Reason Modal */}
      <Modal
        visible={showVoidModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoidModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, SHADOWS.lg]}>
            <Text style={styles.modalTitle}>Delete / Void Transaction</Text>
            <Text style={styles.modalSubtitle}>
              This entry will be excluded from cash totals and closing calculations, and recorded in the audit log.
            </Text>

            <CustomInput
              label="Reason for Voiding / Deleting (Mandatory)"
              placeholder="e.g. Duplicate entry or entered by mistake"
              value={voidReason}
              onChangeText={(txt) => {
                setVoidReason(txt);
                setVoidError(null);
              }}
              multiline
              numberOfLines={3}
              error={voidError || undefined}
            />

            <View style={styles.modalButtonRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowVoidModal(false)}
                disabled={isSubmitting}
                style={styles.modalBtn}
              />
              <CustomButton
                title="Confirm Delete / Void"
                variant="danger"
                onPress={handleVoid}
                loading={isSubmitting}
                style={[styles.modalBtn, { marginLeft: SPACING.md }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: PALETTE.textSecondary,
  },
  headerCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.md,
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.md,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  voidNoticeBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  voidNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b91c1c',
    textTransform: 'uppercase',
  },
  voidNoticeReason: {
    fontSize: 13,
    color: '#991b1b',
    fontWeight: '600',
    marginTop: 2,
  },
  voidNoticeMeta: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.md,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldBlock: {
    paddingVertical: SPACING.sm + 2,
  },
  fieldLabel: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 13,
    color: PALETTE.text,
    fontWeight: '600',
  },
  fieldValueBold: {
    fontSize: 13,
    color: PALETTE.text,
    fontWeight: '800',
  },
  descriptionText: {
    fontSize: 13,
    color: PALETTE.text,
    lineHeight: 18,
    marginTop: 4,
  },
  actionButtonsContainer: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 1,
  },
});
