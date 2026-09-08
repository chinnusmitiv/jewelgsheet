import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { TransactionType, CashDirection } from '../../types';
import { useFinancial } from '../../context/FinancialContext';
import { getEnforcedCashDirection } from '../../utils/financialCalculations';
import { parseAmount, formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { Badge } from '../../components/common/Badge';
import { ConfirmEntryModal } from '../../components/transactions/ConfirmEntryModal';

const TXN_TYPES: { type: TransactionType; label: string; icon: string }[] = [
  { type: 'JEWEL_LOAN', label: 'Jewel Loan', icon: '💍' },
  { type: 'JEWEL_RELEASE', label: 'Jewel Release', icon: '✨' },
  { type: 'INTEREST_RECEIVED', label: 'Release Interest', icon: '📈' },
  { type: 'LOAN_INTEREST', label: 'Loan Interest', icon: '🏦' },
  { type: 'CASH_IN', label: 'Cash IN', icon: '💵' },
  { type: 'CASH_OUT', label: 'Cash OUT', icon: '💸' },
];

const SUGGESTIONS: Record<TransactionType, string[]> = {
  JEWEL_LOAN: ['Gold bangle loan pledge', 'Ring and chain pledge', 'Morning jewel loan'],
  JEWEL_RELEASE: ['Full principal release', 'Jewel release settlement', 'Partial release payment'],
  INTEREST_RECEIVED: ['Monthly pledge interest', 'Overdue jewel interest', 'Token interest payment'],
  LOAN_INTEREST: ['Loan account interest receipt', 'Regular loan interest'],
  CASH_IN: ['Cash received from bank', 'Owner capital float', 'Other income receipt'],
  CASH_OUT: ['Office tea and refreshments', 'Stationery expense', 'Bank cash deposit', 'Maintenance charge'],
};

export const NewEntryScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const initialType = route?.params?.initialType as TransactionType || 'JEWEL_LOAN';
  const { selectedDate, createTransaction, isSubmitting } = useFinancial();

  const [selectedType, setSelectedType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    if (route?.params?.initialType) {
      setSelectedType(route.params.initialType);
    }
  }, [route?.params?.initialType]);

  const cashDirection: CashDirection = getEnforcedCashDirection(selectedType);
  const isCashIn = cashDirection === 'CASH_IN';

  const handleValidateAndPromptConfirm = () => {
    const num = parseAmount(amountStr);
    if (!num || num <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  };

  const handleFinalSave = async () => {
    const num = parseAmount(amountStr);
    const res = await createTransaction({
      transactionType: selectedType,
      amount: num,
      description: description.trim(),
      reference: reference.trim() || undefined,
    });

    if (res.success) {
      setShowConfirmModal(false);
      // Reset or Navigate
      Alert.alert(
        'Entry Saved Successfully',
        `${selectedType.replace(/_/g, ' ')} of ${formatINR(num)} has been recorded.`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setAmountStr('');
              setDescription('');
              setReference('');
            },
          },
          {
            text: 'View Dashboard',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Dashboard' }),
            style: 'default',
          },
        ]
      );
    } else {
      setShowConfirmModal(false);
      setError(res.message || 'Failed to save transaction.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card */}
          <View style={styles.topHeader}>
            <Text style={styles.pageTitle}>New Cash Entry</Text>
            <Text style={styles.pageDate}>{formatDisplayDate(selectedDate)}</Text>
          </View>

          {/* Type Selector Tabs */}
          <Text style={styles.fieldLabel}>Transaction Type</Text>
          <View style={styles.typeGrid}>
            {TXN_TYPES.map((t) => {
              const isSelected = selectedType === t.type;
              return (
                <TouchableOpacity
                  key={t.type}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedType(t.type);
                    setError(null);
                  }}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipSelected,
                    isSelected && {
                      borderColor: isCashIn ? PALETTE.cashIn : PALETTE.cashOut,
                      backgroundColor: isCashIn ? PALETTE.cashInLight : PALETTE.cashOutLight,
                    },
                  ]}
                >
                  <Text style={styles.typeIcon}>{t.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && {
                        color: isCashIn ? PALETTE.cashIn : PALETTE.cashOut,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Auto-Derived Direction Banner */}
          <View
            style={[
              styles.directionBanner,
              {
                backgroundColor: isCashIn ? PALETTE.cashInLight : PALETTE.cashOutLight,
                borderColor: isCashIn ? PALETTE.cashInBorder : PALETTE.cashOutBorder,
              },
            ]}
          >
            <Text style={styles.directionText}>
              Cash Direction (System Enforced):{' '}
              <Text
                style={{
                  fontWeight: '800',
                  color: isCashIn ? PALETTE.cashIn : PALETTE.cashOut,
                }}
              >
                {cashDirection.replace('_', ' ')}
              </Text>
            </Text>
          </View>

          {/* Amount Field */}
          <CustomInput
            label="Transaction Amount (₹)"
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

          {/* Description Field */}
          <CustomInput
            label="Description / Remarks"
            placeholder="e.g. Gold pledge or release details"
            value={description}
            onChangeText={setDescription}
          />

          {/* Quick Description Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Quick Suggestions:</Text>
            <View style={styles.suggestionsRow}>
              {(SUGGESTIONS[selectedType] || []).map((sugg) => (
                <TouchableOpacity
                  key={sugg}
                  style={styles.suggestionPill}
                  onPress={() => setDescription(sugg)}
                >
                  <Text style={styles.suggestionText}>{sugg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reference / Voucher Field */}
          <CustomInput
            label="Reference # / Receipt # (Optional)"
            placeholder="e.g. REF-1092"
            value={reference}
            onChangeText={setReference}
          />

          {/* Save Button */}
          <CustomButton
            title={`Review & Save (${cashDirection.replace('_', ' ')})`}
            variant={isCashIn ? 'success' : 'danger'}
            size="lg"
            onPress={handleValidateAndPromptConfirm}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 2-Tap Confirmation Modal */}
      <ConfirmEntryModal
        visible={showConfirmModal}
        transactionType={selectedType}
        cashDirection={cashDirection}
        amount={parseAmount(amountStr)}
        description={description}
        reference={reference}
        date={selectedDate}
        isSubmitting={isSubmitting}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSave}
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topHeader: {
    marginBottom: SPACING.lg,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.text,
  },
  pageDate: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs + 2,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  typeChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border,
  },
  typeChipSelected: {
    borderColor: PALETTE.primary,
  },
  typeIcon: {
    fontSize: 18,
    marginRight: SPACING.xs + 2,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.text,
  },
  directionBanner: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  directionText: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  suggestionPill: {
    backgroundColor: PALETTE.surfaceSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  suggestionText: {
    fontSize: 11,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
});
