import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';

export const LoadingState = ({ message = "Loading...", fullScreen = true }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Animated.View style={{ opacity: pulseAnim, transform: [{ scale: pulseAnim }] }}>
        <MaterialCommunityIcons name="church" size={80} color={theme.colors.primary} />
      </Animated.View>
      <AppText variant="headingMedium" color="primary" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  }
});
