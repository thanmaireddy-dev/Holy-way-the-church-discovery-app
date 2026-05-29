import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { theme } from '../utils/theme';
import { AppText } from './AppText';

export const AppTextInput = ({ label, error, style, ...props }) => {
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

const styles = StyleSheet.create({
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
