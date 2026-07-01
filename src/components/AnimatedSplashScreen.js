import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../theme/ThemeContext';

export const AnimatedSplashScreen = ({ isAppReady, onAnimationComplete }) => {
  const { isDark } = useTheme();
  
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  const [animationStarted, setAnimationStarted] = useState(false);
  const [readyToFadeOut, setReadyToFadeOut] = useState(false);

  useEffect(() => {
    if (!animationStarted) {
      setAnimationStarted(true);
      
      // Hide native splash screen
      SplashScreen.hideAsync().catch(() => {});
      
      // Fade in the image over 500ms
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Display it for 3 seconds
        setTimeout(() => {
          setReadyToFadeOut(true);
        }, 3000);
      });
    }
  }, [animationStarted, imageOpacity]);

  useEffect(() => {
    // Only proceed to fade out if both the app is ready AND the 3 second hold is complete
    if (isAppReady && readyToFadeOut) {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }
  }, [isAppReady, readyToFadeOut, containerOpacity, onAnimationComplete]);

  // Design Constraints Colors
  const deepEspresso = '#3B2417';
  const warmIvory = '#FAF6EE';
  const backgroundColor = isDark ? deepEspresso : warmIvory;

  return (
    <Animated.View 
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor,
          opacity: containerOpacity,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999, // Ensure it sits on top
        }
      ]}
      pointerEvents="none"
    >
      <Animated.Image 
        source={require('../../assets/splash_new.png')}
        style={{
          width: '100%',
          height: '100%',
          opacity: imageOpacity,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};
