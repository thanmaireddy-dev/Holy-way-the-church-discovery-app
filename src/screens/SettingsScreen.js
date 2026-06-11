import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { useTheme } from '../theme/ThemeContext';

const THEME_OPTIONS = [
  { id: 'light', label: 'Light Mode', icon: 'weather-sunny' },
  { id: 'dark', label: 'Dark Mode', icon: 'weather-night' },
  { id: 'system', label: 'System Default', icon: 'theme-light-dark' },
];

export const SettingsScreen = () => {
  const { theme, appTheme, setAppTheme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleSelectTheme = (themeId) => {
    setAppTheme(themeId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
            Appearance
          </AppText>
          
          {THEME_OPTIONS.map((option, index) => {
            const isSelected = appTheme === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  index === THEME_OPTIONS.length - 1 && styles.lastOptionRow
                ]}
                onPress={() => handleSelectTheme(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <MaterialCommunityIcons 
                    name={option.icon} 
                    size={24} 
                    color={theme.colors.primary} 
                    style={styles.icon}
                  />
                  <AppText variant="bodyMedium" color="text">
                    {option.label}
                  </AppText>
                </View>
                <MaterialCommunityIcons 
                  name={isSelected ? "radiobox-marked" : "radiobox-blank"} 
                  size={24} 
                  color={isSelected ? theme.colors.primary : theme.colors.border} 
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(210, 180, 140, 0.2)', // We can't rely fully on border for opacity easily here, so we keep it subtle or use theme border with opacity
  },
  lastOptionRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.md,
  }
});
