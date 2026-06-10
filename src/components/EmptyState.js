import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { theme } from '../utils/theme';

export const EmptyState = ({ 
  icon = "church", 
  message = "No exact matches found", 
  subtitle, 
  actionLabel, 
  onAction,
  fullScreen = true
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <MaterialCommunityIcons name={icon} size={80} color={theme.colors.primary} style={styles.icon} />
      <AppText variant="headingMedium" color="primary" style={styles.message} align="center">
        {message}
      </AppText>
      {subtitle && (
        <AppText variant="body" color="textLight" style={styles.subtitle} align="center">
          {subtitle}
        </AppText>
      )}
      {actionLabel && onAction && (
        <AppButton 
          title={actionLabel} 
          onPress={onAction} 
          style={styles.actionButton}
          variant="outline"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  icon: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  message: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.xl,
  }
});
