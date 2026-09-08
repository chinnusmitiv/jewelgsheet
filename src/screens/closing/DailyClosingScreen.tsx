import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { formatINR, parseAmount } from '../../utils/currency';
import { formatDisplayDate, formatDisplayTime } from '../../utils/date';
import { calculateCashDifference, validateClosingReason } from '../../utils/financialCalculations';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { ReopenDayModal } from '../../components/closing/ReopenDayModal';

export const DailyClosingScreen: React.FC = () => {
  const { user } = useAuth();
  const { dashboard, selectedDate, finalizeDay, reopenDay, isSubmitting } = useFinancial();

  const [actualCashStr, setActualCashStr] = useState<string>('');
  const [differenceReason, setDifferenceReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);

  const isClosed = dashboard?.dayStatus === 'CLOSED';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (dashboard?.actualCash !== undefined && dashboard.actualCash !== null) {
      setActualCashStr(String(dashboard.actualCash));
      setDifferenceReason(dashboard.differenceReason || '');
    } else {
      setActualCashStr('');
      setDifferenceReason('');
    }
    setError(null);
  }, [dashboard]);

  const expectedClosing = dashboard?.expectedClosingCash ?? 0;
  const currentActual = parseAmount(actualCashStr);
  const diffResult = calculateCashDifference(currentActual, expectedClosing);

  const handleFinalize = async () => {
    if (!isAdmin) {
      setError('Only Administrators can finalize daily closing.');
      return;
    }

    if (!actualCashStr || actualCashStr.trim().length === 0) {
      setError('Please enter the actual physical cash counted.');
      return;
    }

    const validation = validateClosingReason(diffResult.difference, differenceReason);
    if (!validation.valid) {
      setError(validation.errorMessage || 'Reason is required for cash difference.');
      return;
    }

    setError(null);

    Alert.alert(
      'Confirm Finalize & Lock',
      `Are you sure you want to finalize closing for ${formatDisplayDate(selectedDate)}?\n\nExpected: ${formatINR(expectedClosing)}\nActual: ${formatINR(currentActual)}\nDifference: ${formatINR(diffResult.difference)} (${diffResult.status})\n\nOnce locked, no new transactions can be created for this date.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize Day',
          style: 'destructive',
          onPress: async () => {
            const success = await finalizeDay(currentActual, differenceReason.trim() || undefined);
            if (success) {
              Alert.alert('Day Closed', 'Business day has been finalized and locked.');
            } else {
              setError('Failed to finalize day.');
            }
          },
        },
      ]
    );
  };

  const getStatusVariant = () => {
    if (diffResult.status === 'BALANCED') return 'balanced';
    if (diffResult.status === 'SHORT') return 'short';
    return 'excess';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Daily Closing" subtitle={formatDisplayDate(selectedDate)} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Day Status Card */}
          <View style={[styles.statusCard, isClosed ? styles.closedCard : styles.openCard]}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Business Date Status</Text>
              <Badge
                label={isClosed ? 'CLOSED (LOCKED)' : 'OPEN FOR ENTRIES'}
                variant={isClosed ? 'closed' : 'open'}
                size="md"
              />
            </View>
            <Text style={styles.statusSubtext}>
              {isClosed
                ? 'This date is locked. Financial entries cannot be added or edited.'
                : 'Transactions are currently active and updating totals live.'}
            </Text>
          </View>

          {/* Full Financial Breakdown Table */}
          <View style={[styles.tableCard, SHADOWS.sm]}>
            <Text style={styles.tableHeading}>Cash Flow Reconciliation</Text>

            {/* Opening Cash */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabelBold}>Opening Cash Float</Text>
              <Text style={styles.tableValueBold}>
                {formatINR(dashboard?.openingCash ?? 0)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Cash IN Section */}
            <Text style={styles.subSectionTitle}>Cash IN Breakdown (+)</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Jewel Release</Text>
              <Text style={styles.tableValue}>
                {formatINR(dashboard?.breakdown.jewelRelease ?? 0)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Interest Received</Text>
              <Text style={styles.tableValue}>
                {formatINR(dashboard?.breakdown.interestReceived ?? 0)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Loan Interest</Text>
              <Text style={styles.tableValue}>
                {formatINR(dashboard?.breakdown.loanInterest ?? 0)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Manual Cash IN</Text>
              <Text style={styles.tableValue}>
                {formatINR(dashboard?.breakdown.cashIn ?? 0)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.subTotalRow]}>
              <Text style={[styles.tableLabelBold, { color: PALETTE.cashIn }]}>
                TOTAL CASH IN
              </Text>
              <Text style={[styles.tableValueBold, { color: PALETTE.cashIn }]}>
                +{formatINR(dashboard?.totalCashIn ?? 0)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Cash OUT Section */}
            <Text style={styles.subSectionTitle}>Cash OUT Breakdown (-)</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Jewel Loan Disbursements</Text>
              <Text style={styles.tableValue}>
                {formatINR(dashboard?.breakdown.jewelLoan ?? 0)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Manual Cash OUT</Text>
              <Text style={styles.tableValue}>
                {formatINR(dashboard?.breakdown.cashOut ?? 0)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.subTotalRow]}>
              <Text style={[styles.tableLabelBold, { color: PALETTE.cashOut }]}>
                TOTAL CASH OUT
              </Text>
              <Text style={[styles.tableValueBold, { color: PALETTE.cashOut }]}>
                -{formatINR(dashboard?.totalCashOut ?? 0)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Expected Closing */}
            <View style={[styles.tableRow, styles.heroRow]}>
              <Text style={styles.heroRowLabel}>EXPECTED CLOSING CASH</Text>
              <Text style={styles.heroRowValue}>
                {formatINR(dashboard?.expectedClosingCash ?? 0)}
              </Text>
            </View>
          </View>

          {/* Physical Cash Verification Card */}
          <View style={[styles.verificationCard, SHADOWS.md]}>
            <Text style={styles.sectionHeading}>Physical Cash Count & Audit</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Actual Physical Cash (₹)"
              placeholder="0"
              keyboardType="numeric"
              value={actualCashStr}
              onChangeText={(txt) => {
                setActualCashStr(txt);
                setError(null);
              }}
              prefix="₹"
              isAmountInput
              editable={!isClosed}
            />

            {/* Live Difference Badge */}
            {actualCashStr.length > 0 && (
              <View style={styles.diffSummaryBox}>
                <View style={styles.diffRow}>
                  <Text style={styles.diffLabel}>Variance / Difference:</Text>
                  <Text
                    style={[
                      styles.diffValue,
                      { color: diffResult.difference === 0 ? PALETTE.cashIn : PALETTE.cashOut },
                    ]}
                  >
                    {formatINR(diffResult.difference)}
                  </Text>
                </View>

                <View style={styles.diffStatusRow}>
                  <Text style={styles.diffStatusLabel}>Status:</Text>
                  <Badge
                    label={diffResult.status}
                    variant={getStatusVariant()}
                    size="md"
                  />
                </View>
              </View>
            )}

            {/* Reason input if difference != 0 */}
            {actualCashStr.length > 0 && diffResult.difference !== 0 && (
              <CustomInput
                label="Difference Reason (Mandatory)"
                placeholder="e.g. Minor cash rounding deficit"
                value={differenceReason}
                onChangeText={(txt) => {
                  setDifferenceReason(txt);
                  setError(null);
                }}
                multiline
                numberOfLines={2}
                editable={!isClosed}
              />
            )}

            {/* Action Buttons */}
            {!isClosed ? (
              <CustomButton
                title={isAdmin ? 'Finalize & Lock Business Day' : 'Admin Required to Finalize'}
                variant="danger"
                size="lg"
                onPress={handleFinalize}
                disabled={!isAdmin}
                loading={isSubmitting}
                style={styles.finalizeBtn}
              />
            ) : (
              isAdmin && (
                <CustomButton
                  title="Reopen Business Day (Admin)"
                  variant="gold"
                  size="lg"
                  onPress={() => setShowReopenModal(true)}
                  style={styles.reopenBtn}
                />
              )
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Admin Reopen Modal */}
      <ReopenDayModal
        visible={showReopenModal}
        businessDate={selectedDate}
        onClose={() => setShowReopenModal(false)}
        onReopen={reopenDay}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  statusCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  openCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  closedCard: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.text,
  },
  statusSubtext: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    marginTop: 4,
  },
  tableCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.md,
  },
  tableHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    marginVertical: SPACING.xs + 2,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  subTotalRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tableLabel: {
    fontSize: 13,
    color: PALETTE.textSecondary,
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.text,
  },
  tableLabelBold: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.text,
  },
  tableValueBold: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: SPACING.sm,
  },
  heroRow: {
    backgroundColor: PALETTE.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
  },
  heroRowLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.primary,
  },
  heroRowValue: {
    fontSize: 18,
    fontWeight: '900',
    color: PALETTE.primary,
  },
  verificationCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.xl,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.text,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: PALETTE.cashOutLight,
    borderColor: PALETTE.cashOutBorder,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorBoxText: {
    color: PALETTE.cashOut,
    fontSize: 12,
    fontWeight: '600',
  },
  diffSummaryBox: {
    backgroundColor: PALETTE.surfaceSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.md,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  diffLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.textSecondary,
  },
  diffValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  diffStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  finalizeBtn: {
    marginTop: SPACING.sm,
  },
  reopenBtn: {
    marginTop: SPACING.sm,
  },
});
