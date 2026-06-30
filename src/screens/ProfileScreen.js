import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { UserDataContext } from '../context/UserDataContext';
import { useTheme } from '../theme/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appConfig from '../../app.json';

const DENOMINATIONS = ["All", "Catholic", "Methodist", "Pentecostal", "Baptist", "Orthodox", "CSI"];
const LANGUAGES = ["All", "English", "Telugu", "Tamil", "Malayalam", "Hindi"];

export const ProfileScreen = ({ navigation }) => {
  const { currentUser, isGuest, logout } = useAuth();
  const { preferences, updatePreferences } = useContext(UserDataContext);
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);

  const appVersion = appConfig?.expo?.version || '1.0.0';

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
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={() => navigation.navigate('About')}
          >
            <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

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

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
              HolyWay Today
            </AppText>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <AppText variant="headingMedium" color="primary" style={styles.statNumber}>158</AppText>
                <AppText variant="bodySmall" color="textLight" style={styles.statLabel}>Churches</AppText>
              </View>
              <View style={styles.statCard}>
                <AppText variant="headingMedium" color="primary" style={styles.statNumber}>7</AppText>
                <AppText variant="bodySmall" color="textLight" style={styles.statLabel}>Denominations</AppText>
              </View>
              <View style={styles.statCard}>
                <AppText variant="headingMedium" color="primary" style={styles.statNumber}>6</AppText>
                <AppText variant="bodySmall" color="textLight" style={styles.statLabel}>Languages</AppText>
              </View>
              <View style={styles.statCard}>
                <AppText variant="headingMedium" color="primary" style={styles.statNumber}>100+</AppText>
                <AppText variant="bodySmall" color="textLight" style={styles.statLabel}>Feast Days</AppText>
              </View>
            </View>
          </View>

          <AppButton 
            title="Settings" 
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
            variant="secondary"
          />

          <AppButton 
            title={isGuest ? 'Exit Guest Mode' : 'Log Out'} 
            onPress={handleLogout}
            style={styles.logoutButton}
            variant="secondary"
          />
        </View>

        <View style={styles.footer}>
          <AppText style={styles.footerVersion}>
            HolyWay{'\n'}Version {appVersion}
          </AppText>
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
    marginTop: theme.spacing.md,
  },
  settingsButton: {
    marginTop: theme.spacing.xl,
  },
  infoButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 1,
    padding: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.isDark ? theme.colors.background : '#FDFBF7',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.isDark ? theme.colors.border : 'rgba(210, 180, 140, 0.4)',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  statNumber: {
    marginBottom: 4,
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.colors.primary,
    opacity: 0.65,
    lineHeight: 16,
    letterSpacing: 0.5,
  }
});
