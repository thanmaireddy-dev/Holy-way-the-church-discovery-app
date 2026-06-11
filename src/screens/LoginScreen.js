import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { login, loginAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
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
        <View style={styles.header}>
          <AppText variant="heading" color="primary" align="center" style={styles.title}>
            Holy Way
          </AppText>
          <AppText variant="bodyMedium" color="textLight" align="center">
            Discover churches near you
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <AppText color="error" style={styles.errorText}>{error}</AppText> : null}

          <AppButton 
            title="Log In" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.primaryButton}
          />

          <AppButton 
            title="Continue as Guest" 
            variant="secondary"
            onPress={loginAsGuest} 
            style={styles.secondaryButton}
          />
        </View>

        <View style={styles.footer}>
          <AppText color="textLight">Don't have an account? </AppText>
          <AppText 
            color="primary" 
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign Up
          </AppText>
        </View>
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
  secondaryButton: {
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
  },
  link: {
    fontFamily: theme.typography.bodyMedium,
    textDecorationLine: 'underline',
  }
});
