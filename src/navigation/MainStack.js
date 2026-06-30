import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { ChurchDetailsScreen } from '../screens/ChurchDetailsScreen';
import { SuggestCorrectionScreen } from '../screens/SuggestCorrectionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.headingMedium,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChurchDetails" 
        component={ChurchDetailsScreen} 
        options={{ title: 'Details' }}
      />
      <Stack.Screen 
        name="SuggestCorrection" 
        component={SuggestCorrectionScreen} 
        options={{ title: 'Suggest Correction' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About HolyWay' }}
      />
    </Stack.Navigator>
  );
};
