import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'gold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          btn: { backgroundColor: PALETTE.cashIn, borderColor: PALETTE.cashIn },
          text: { color: PALETTE.textInverse },
        };
      case 'danger':
        return {
          btn: { backgroundColor: PALETTE.cashOut, borderColor: PALETTE.cashOut },
          text: { color: PALETTE.textInverse },
        };
      case 'gold':
        return {
          btn: { backgroundColor: PALETTE.jewelGold, borderColor: PALETTE.jewelGold },
          text: { color: PALETTE.textInverse },
        };
      case 'outline':
        return {
          btn: {
            backgroundColor: 'transparent',
            borderColor: PALETTE.borderDark,
            borderWidth: 1.5,
          },
          text: { color: PALETTE.text },
        };
      case 'ghost':
        return {
          btn: { backgroundColor: 'transparent', borderColor: 'transparent' },
          text: { color: PALETTE.primary },
        };
      case 'primary':
      default:
        return {
          btn: { backgroundColor: PALETTE.primary, borderColor: PALETTE.primary },
          text: { color: PALETTE.textInverse },
        };
    }
  };

  const themeStyles = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.baseButton,
        size === 'sm' && styles.btnSm,
        size === 'lg' && styles.btnLg,
        themeStyles.btn,
        disabled && styles.disabled,
        variant !== 'ghost' && variant !== 'outline' && SHADOWS.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? PALETTE.primary : '#ffffff'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.baseText,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              themeStyles.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    flexDirection: 'row',
  },
  btnSm: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    minHeight: 36,
    borderRadius: RADIUS.sm,
  },
  btnLg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    minHeight: 56,
    borderRadius: RADIUS.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 13,
  },
  textLg: {
    fontSize: 17,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
});
