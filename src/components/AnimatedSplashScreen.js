import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../theme/ThemeContext';
import { SplashLogoSVG } from './SplashLogoSVG';

export const AnimatedSplashScreen = ({ isAppReady, onAnimationComplete }) => {
  const { isDark } = useTheme();
  
  // Animated values
  const arcOpacity = useRef(new Animated.Value(0)).current;
  const crossOpacity = useRef(new Animated.Value(0)).current;
  const churchTranslateY = useRef(new Animated.Value(120)).current; // Start pushed down fully (120 is church SVG height)
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (!animationStarted) {
      setAnimationStarted(true);
      
      // Hide native splash screen
      SplashScreen.hideAsync().catch(() => {});
      
      // Execute the staggered sequence
      // 0.0s Background renders (handled by style)
      // 0.3s Cross fades in. Arc also fades in together to establish ground.
      const timeline = [
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(crossOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(arcOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
        // 0.6s Church outline drawn from bottom to top
        // (Wait, since we already delayed 300 + 400 = 700. We can overlap them using Animated.parallel or stagger)
      ];

      // To hit the exact timestamps requested:
      // 0.3s: Cross in
      // 0.6s: Church in
      // 1.0s: HolyWay text in
      // 1.2s: Tagline in
      // 1.6s: Glow in
      // 1.8s: Hold
      // 2.1s: Fade out
      
      // A more precise way to hit exact timestamps is mapping an Animated.Value(0) to 2100ms
      // But using staggered Animated sequence is usually fine.
      
      Animated.sequence([
        // 0.0 -> 0.3s
        Animated.delay(300),
        
        // 0.3s -> 0.6s: Cross fades in (duration 300ms)
        Animated.timing(crossOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        
        // 0.6s -> 1.0s: Church slides up (duration 400ms)
        Animated.parallel([
          Animated.timing(arcOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(churchTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        
        // 1.0s -> 1.2s: HolyWay text fades in (duration 200ms)
        Animated.timing(textOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        
        // 1.2s -> 1.6s: Tagline fades in (duration 400ms)
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        
        // 1.6s -> 1.8s: Glow fades in (duration 200ms)
        Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        
      ]).start();
    }
  }, [animationStarted]);

  useEffect(() => {
    // Only proceed to fade out if both the app is ready AND we have reached the hold mark
    // To ensure we don't fade out prematurely if isAppReady is true instantly, 
    // we should wait at least 1800ms.
    if (isAppReady && animationStarted) {
      // 1.8s Hold + 2.1s fade out.
      // Since our entrance animations total 1800ms, we wait until they finish (or just delay 1800).
      Animated.sequence([
        Animated.delay(1800), // Minimum delay
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete();
      });
    }
  }, [isAppReady, animationStarted]);

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
      <SplashLogoSVG 
        crossOpacity={crossOpacity}
        churchTranslateY={churchTranslateY}
        glowOpacity={glowOpacity}
        textOpacity={textOpacity}
        taglineOpacity={taglineOpacity}
        arcOpacity={arcOpacity}
      />
    </Animated.View>
  );
};
