import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';

// We are only using local notifications, so we can safely ignore the Expo Go push notification warning
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import { useFonts } from 'expo-font';
import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/utils/theme';
import { AppText } from './src/components/AppText';

// Inner component that waits for both fonts and Auth state
const AppLoader = () => {
  const { loading: authLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  if (authLoading || !fontsLoaded) {
    return (
      <View style={styles.splashContainer}>
        {/* We use default Text here because AppText relies on fonts being loaded */}
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <RootNavigator />;
};

import { UserDataProvider } from './src/context/UserDataContext';

export default function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <AppLoader />
      </UserDataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
