import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../utils/theme';

export const AppButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  loading = false,
  disabled = false,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        isPrimary ? styles.primaryBg : styles.secondaryBg,
        (disabled || loading) && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.surface : theme.colors.primary} />
      ) : (
        <AppText 
          variant="bodyMedium" 
          color={isPrimary ? 'surface' : 'primary'}
          align="center"
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBg: {
    backgroundColor: theme.colors.secondary, // Deep Wine Red for primary buttons as per guidelines
  },
  secondaryBg: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.6,
  }
});
