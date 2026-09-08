import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PALETTE, RADIUS, SPACING } from '../../constants/theme';
import { DifferenceStatus, DayStatus, CashDirection, TransactionStatus } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'cashIn' | 'cashOut' | 'balanced' | 'short' | 'excess' | 'open' | 'closed' | 'voided' | 'neutral' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'cashIn':
        return { bg: PALETTE.cashInLight, text: PALETTE.cashIn, border: PALETTE.cashInBorder };
      case 'cashOut':
        return { bg: PALETTE.cashOutLight, text: PALETTE.cashOut, border: PALETTE.cashOutBorder };
      case 'balanced':
        return { bg: PALETTE.balancedLight, text: PALETTE.balanced, border: PALETTE.cashInBorder };
      case 'short':
        return { bg: PALETTE.shortLight, text: PALETTE.short, border: PALETTE.cashOutBorder };
      case 'excess':
        return { bg: PALETTE.excessLight, text: PALETTE.excess, border: '#bae6fd' };
      case 'open':
        return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'closed':
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
      case 'voided':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'gold':
        return { bg: PALETTE.jewelGoldLight, text: PALETTE.jewelGold, border: PALETTE.jewelGoldBorder };
      default:
        return { bg: PALETTE.surfaceSubtle, text: PALETTE.textSecondary, border: PALETTE.border };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        size === 'sm' && styles.badgeSm,
        size === 'lg' && styles.badgeLg,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 1,
  },
  badgeLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
  textLg: {
    fontSize: 13,
  },
});
