import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { UserDataContext } from '../context/UserDataContext';
import { theme } from '../utils/theme';

const DENOMINATIONS = ["All", "Catholic", "Methodist", "Pentecostal", "Baptist", "Orthodox", "CSI"];
const LANGUAGES = ["All", "English", "Telugu", "Tamil", "Malayalam", "Hindi"];

export const ProfileScreen = () => {
  const { currentUser, isGuest, logout } = useAuth();
  const { preferences, updatePreferences } = useContext(UserDataContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400); // Smooth transition
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const renderPills = (options, selectedValue, onSelect) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
      {options.map(option => {
        const isSelected = (selectedValue === option) || (option === "All" && !selectedValue);
        return (
          <TouchableOpacity 
            key={option} 
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelect(option === "All" ? null : option)}
          >
            <AppText 
              variant="bodyMedium" 
              style={[styles.pillText, isSelected && styles.pillTextSelected]}
            >
              {option}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <AppText variant="headingMedium" color="primary" style={styles.title}>
            User Profile
          </AppText>

          <View style={styles.infoSection}>
            <AppText variant="bodyMedium" color="textLight">Status</AppText>
            <AppText variant="body" color="text">
              {isGuest ? 'Guest User' : 'Registered User'}
            </AppText>
          </View>

          {!isGuest && currentUser && (
            <View style={styles.infoSection}>
              <AppText variant="bodyMedium" color="textLight">Email</AppText>
              <AppText variant="body" color="text">
                {currentUser.email}
              </AppText>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
              Preferences
            </AppText>
            
            <AppText variant="bodyMedium" color="textLight" style={styles.prefLabel}>Preferred Denomination</AppText>
            {renderPills(DENOMINATIONS, preferences.denomination, (val) => updatePreferences({ denomination: val }))}

            <AppText variant="bodyMedium" color="textLight" style={styles.prefLabel}>Preferred Language</AppText>
            {renderPills(LANGUAGES, preferences.language, (val) => updatePreferences({ language: val }))}
          </View>

          <AppButton 
            title={isGuest ? 'Exit Guest Mode' : 'Log Out'} 
            onPress={handleLogout}
            style={styles.logoutButton}
            variant="secondary"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.3)',
    marginBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
    opacity: 0.5,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  prefLabel: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  pillsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: theme.colors.primary,
  },
  pillText: {
    color: theme.colors.primary,
  },
  pillTextSelected: {
    color: theme.colors.surface,
  },
  logoutButton: {
    marginTop: theme.spacing.xl,
  }
});
