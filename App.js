import React, { useState } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent native splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {});

// We are only using local notifications, so we can safely ignore the Expo Go push notification warning
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import { useFonts } from 'expo-font';
import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { UserDataProvider } from './src/context/UserDataContext';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';

// Inner component that waits for both fonts and Auth state
const AppLoader = () => {
  const { loading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  // The app is "ready" when fonts and auth are completely loaded.
  // ThemeContext handles its own readiness before rendering AppLoader.
  const isAppReady = fontsLoaded && !authLoading;

  return (
    <View style={styles.container}>
      {isAppReady && (
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      )}

      {!isSplashAnimationComplete && (
        <AnimatedSplashScreen 
          isAppReady={isAppReady} 
          onAnimationComplete={() => setAnimationComplete(true)} 
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserDataProvider>
          <AppLoader />
        </UserDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
