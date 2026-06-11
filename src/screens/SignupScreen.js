import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export const SignupScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
    } catch (err) {
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AppText variant="heading" color="primary" align="center" style={styles.title}>
              Join Holy Way
            </AppText>
            <AppText variant="bodyMedium" color="textLight" align="center">
              Create an account to start discovering
            </AppText>
          </View>

          <View style={styles.form}>
            <AppTextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AppTextInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <AppTextInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {error ? <AppText color="error" style={styles.errorText}>{error}</AppText> : null}

            <AppButton 
              title="Sign Up" 
              onPress={handleSignup} 
              loading={loading}
              style={styles.primaryButton}
            />
          </View>

          <View style={styles.footer}>
            <AppText color="textLight">Already have an account? </AppText>
            <AppText 
              color="primary" 
              style={styles.link}
              onPress={() => navigation.goBack()}
            >
              Log In
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    marginTop: theme.spacing.md,
  },
  errorText: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  link: {
    fontFamily: theme.typography.bodyMedium,
    textDecorationLine: 'underline',
  }
});
