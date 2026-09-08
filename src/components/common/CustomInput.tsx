import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { PALETTE, RADIUS, SPACING } from '../../constants/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
  isAmountInput?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  prefix,
  suffix,
  containerStyle,
  isAmountInput,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isAmountInput && styles.amountWrapper,
          error ? styles.inputError : undefined,
        ]}
      >
        {prefix && (
          <Text style={[styles.prefix, isAmountInput && styles.amountPrefix]}>
            {prefix}
          </Text>
        )}
        <TextInput
          placeholderTextColor={PALETTE.textMuted}
          style={[
            styles.input,
            isAmountInput && styles.amountInput,
            style,
          ]}
          {...rest}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderWidth: 1.5,
    borderColor: PALETTE.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  amountWrapper: {
    minHeight: 56,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: '#ffffff',
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    marginRight: SPACING.xs,
  },
  amountPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: PALETTE.primary,
  },
  suffix: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginLeft: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.text,
    paddingVertical: SPACING.sm,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '700',
    color: PALETTE.text,
  },
  inputError: {
    borderColor: PALETTE.cashOut,
    backgroundColor: PALETTE.cashOutLight,
  },
  errorText: {
    fontSize: 12,
    color: PALETTE.cashOut,
    marginTop: 4,
    fontWeight: '500',
  },
});
