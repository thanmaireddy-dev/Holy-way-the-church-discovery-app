import React, { useMemo } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';

export const AppTextInput = ({ label, error, style, ...props }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <AppText variant="bodyMedium" color="textLight" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError
        ]}
        placeholderTextColor={theme.colors.border}
        {...props}
      />
      {error && (
        <AppText variant="caption" color="error" style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.xs,
  }
});
