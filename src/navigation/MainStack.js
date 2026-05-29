import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { ChurchDetailsScreen } from '../screens/ChurchDetailsScreen';
import { SuggestCorrectionScreen } from '../screens/SuggestCorrectionScreen';
import { theme } from '../utils/theme';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
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
        options={{ headerShown: false }} // The tabs will not have a global header, each tab can manage its own title or just show it in the UI
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
    </Stack.Navigator>
  );
};
