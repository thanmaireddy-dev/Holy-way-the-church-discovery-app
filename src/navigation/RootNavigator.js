import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { useAuth } from '../context/AuthContext';

export const RootNavigator = () => {
  const { currentUser, isGuest } = useAuth();

  const isAuthenticated = currentUser !== null || isGuest;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
