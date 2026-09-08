import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface MetricCardProps {
  label: string;
  amount: number | undefined | null;
  variant?: 'primary' | 'cashIn' | 'cashOut' | 'gold' | 'balanced' | 'short' | 'excess' | 'neutral';
  subtitle?: string;
  badge?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  amount,
  variant = 'neutral',
  subtitle,
  badge,
  onPress,
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'cashIn':
        return {
          bg: PALETTE.cashInLight,
          border: PALETTE.cashInBorder,
          text: PALETTE.cashIn,
          accent: '#059669',
        };
      case 'cashOut':
        return {
          bg: PALETTE.cashOutLight,
          border: PALETTE.cashOutBorder,
          text: PALETTE.cashOut,
          accent: '#dc2626',
        };
      case 'gold':
        return {
          bg: PALETTE.jewelGoldLight,
          border: PALETTE.jewelGoldBorder,
          text: PALETTE.jewelGold,
          accent: '#d97706',
        };
      case 'short':
        return {
          bg: PALETTE.shortLight,
          border: PALETTE.short,
          text: PALETTE.short,
          accent: '#dc2626',
        };
      case 'excess':
        return {
          bg: PALETTE.excessLight,
          border: '#0284c7',
          text: PALETTE.excess,
          accent: '#0284c7',
        };
      case 'balanced':
        return {
          bg: PALETTE.balancedLight,
          border: PALETTE.balanced,
          text: PALETTE.balanced,
          accent: '#059669',
        };
      case 'primary':
        return {
          bg: PALETTE.primaryLight,
          border: PALETTE.primaryBorder,
          text: PALETTE.primary,
          accent: '#2563eb',
        };
      default:
        return {
          bg: PALETTE.surface,
          border: PALETTE.border,
          text: PALETTE.text,
          accent: PALETTE.textSecondary,
        };
    }
  };

  const colors = getColors();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.bg, borderColor: colors.border },
        SHADOWS.sm,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {badge}
      </View>

      <Text style={[styles.amount, { color: colors.text }]}>
        {formatINR(amount ?? 0)}
      </Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: PALETTE.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
