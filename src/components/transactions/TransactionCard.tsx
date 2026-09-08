import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { Transaction } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayTime } from '../../utils/date';
import { Badge } from '../common/Badge';

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const isCashIn = transaction.cashDirection === 'CASH_IN';
  const isVoided = transaction.status === 'VOIDED';

  const formatTypeName = (type: string) => {
    if (type === 'INTEREST_RECEIVED') return 'Release Interest';
    return type.replace(/_/g, ' ');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isVoided && styles.voidedCard,
        SHADOWS.sm,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.typeRow}>
          <View
            style={[
              styles.indicatorDot,
              { backgroundColor: isVoided ? PALETTE.textMuted : isCashIn ? PALETTE.cashIn : PALETTE.cashOut },
            ]}
          />
          <Text style={[styles.typeText, isVoided && styles.voidedText]}>
            {formatTypeName(transaction.transactionType)}
          </Text>
        </View>

        <Badge
          label={isVoided ? 'VOIDED' : transaction.cashDirection.replace('_', ' ')}
          variant={isVoided ? 'voided' : isCashIn ? 'cashIn' : 'cashOut'}
          size="sm"
        />
      </View>

      <View style={styles.middleRow}>
        <Text
          style={[
            styles.amount,
            { color: isVoided ? PALETTE.textMuted : isCashIn ? PALETTE.cashIn : PALETTE.cashOut },
            isVoided && styles.strikethrough,
          ]}
        >
          {isCashIn ? '+' : '-'}{formatINR(transaction.amount)}
        </Text>
        <Text style={styles.timeText}>
          {formatDisplayTime(transaction.transactionTime || transaction.createdAt)}
        </Text>
      </View>

      {transaction.description ? (
        <Text
          style={[styles.description, isVoided && styles.voidedText]}
          numberOfLines={2}
        >
          {transaction.description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <Text style={styles.enteredByText}>
          By: {transaction.createdByName || transaction.createdBy}
        </Text>
        {transaction.reference ? (
          <Text style={styles.refText}>Ref: {transaction.reference}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  voidedCard: {
    backgroundColor: '#fafafa',
    borderColor: '#e5e7eb',
    opacity: 0.75,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: SPACING.xs + 2,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.text,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginVertical: SPACING.xs,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  timeText: {
    fontSize: 12,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  voidedText: {
    color: PALETTE.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: SPACING.xs + 2,
    marginTop: SPACING.xs,
  },
  enteredByText: {
    fontSize: 11,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  refText: {
    fontSize: 11,
    color: PALETTE.textMuted,
  },
});
