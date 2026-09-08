import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { PALETTE, RADIUS, SPACING } from '../../constants/theme';

interface StatusBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  style?: ViewStyle;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  type,
  title,
  message,
  style,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#b45309',
        };
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#b91c1c',
        };
      case 'success':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#047857',
        };
      case 'info':
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#1d4ed8',
        };
    }
  };

  const colors = getStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
