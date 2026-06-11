import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { theme as staticTheme } from '../utils/theme'; // Fallback

// We can't use hooks like useTheme inside a class component easily, 
// so we'll use a static theme for the fatal error screen or a generic dark look.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#D26466" style={styles.icon} />
            <AppText variant="headingMedium" style={styles.title}>
              Something went wrong
            </AppText>
            <AppText variant="body" style={styles.subtitle} align="center">
              We encountered an unexpected error. Please try again.
            </AppText>
            <View style={styles.buttonRow}>
              <AppButton 
                title="Retry" 
                onPress={this.handleRetry} 
                style={styles.button}
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#241712', // Use dark background explicitly for safety
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    color: '#F2E8D9',
    marginBottom: 12,
  },
  subtitle: {
    color: '#CBBDAE',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonRow: {
    width: '100%',
    paddingHorizontal: 24,
  },
  button: {
    width: '100%',
  }
});
