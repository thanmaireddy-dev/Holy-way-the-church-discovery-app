import React from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export const SplashLogoSVG = ({ 
  crossOpacity, 
  churchTranslateY, 
  glowOpacity, 
  textOpacity,
  taglineOpacity,
  arcOpacity
}) => {
  const { isDark, theme } = useTheme();
  
  // Specific colors from the design mockup
  const deepEspresso = '#3B2417';
  const warmIvory = '#FAF6EE';
  const mutedGold = '#C9A35A';

  const logoColor = isDark ? warmIvory : deepEspresso;
  const bgColor = isDark ? deepEspresso : warmIvory;

  return (
    <View style={styles.container}>
      
      {/* 
        TOP SECTION: The Logo 
        Contains Cross, olyWay text, Church, and Golden Arc 
      */}
      <View style={styles.logoContainer}>
        
        {/* Golden Arc (Ground) */}
        <Animated.View style={[styles.arcContainer, { opacity: arcOpacity }]}>
          <Svg width="260" height="40" viewBox="0 0 260 40">
            {/* Smooth gentle curve fading out at edges */}
            <Path d="M 0 35 Q 130 5 260 35" fill="none" stroke={mutedGold} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </Animated.View>

        {/* The Cross (H) */}
        <Animated.View style={[styles.crossContainer, { opacity: crossOpacity }]}>
          <Svg width="80" height="140" viewBox="0 0 80 140">
            <G>
              {/* Main cross shape with slight stylized curves/serifs if desired */}
              <Path 
                d="M 35 10 
                   L 45 10 
                   L 45 40 
                   L 70 40 
                   L 70 50 
                   L 45 50 
                   L 45 130 
                   C 45 135 40 135 35 130 
                   L 35 50 
                   L 10 50 
                   L 10 40 
                   L 35 40 
                   Z" 
                fill={logoColor} 
              />
            </G>
          </Svg>
          
          {/* Subtle Muted Gold Glow */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
            <Svg width="80" height="140" viewBox="0 0 80 140">
              <Path 
                d="M 35 10 L 45 10 L 45 40 L 70 40 L 70 50 L 45 50 L 45 130 C 45 135 40 135 35 130 L 35 50 L 10 50 L 10 40 L 35 40 Z" 
                fill="none" 
                stroke={mutedGold} 
                strokeWidth="5" 
                strokeOpacity="0.6"
                strokeLinejoin="round"
              />
              <Path 
                d="M 35 10 L 45 10 L 45 40 L 70 40 L 70 50 L 45 50 L 45 130 C 45 135 40 135 35 130 L 35 50 L 10 50 L 10 40 L 35 40 Z" 
                fill="none" 
                stroke={mutedGold} 
                strokeWidth="10" 
                strokeOpacity="0.3"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* 'olyWay' Text next to the cross */}
        <Animated.View style={[styles.olyWayContainer, { opacity: crossOpacity }]}>
          <Text style={[styles.olyWayText, { color: logoColor }]}>olyWay</Text>
        </Animated.View>

        {/* The Church Reveal Container */}
        <View style={styles.churchClipContainer}>
          {/* translateY animates from 100 to 0, giving a 'drawn from bottom to top' effect */}
          <Animated.View style={{ transform: [{ translateY: churchTranslateY }] }}>
            <Svg width="80" height="120" viewBox="0 0 80 120">
              
              {/* Main Hall */}
              <Path d="M 0 70 L 45 70 L 45 110 L 0 110 Z" fill={logoColor} />
              <Path d="M -5 70 L 22.5 45 L 50 70 Z" fill={logoColor} />
              
              {/* Steeple */}
              <Path d="M 40 50 L 65 50 L 65 110 L 40 110 Z" fill={logoColor} />
              <Path d="M 35 50 L 52.5 15 L 70 50 Z" fill={logoColor} />
              
              {/* Steeple Cross */}
              <Path d="M 51 3 L 54 3 L 54 15 L 51 15 Z" fill={logoColor} />
              <Path d="M 48 7 L 57 7 L 57 10 L 48 10 Z" fill={logoColor} />

              {/* Arched Windows (Cutouts using bg color) */}
              <Path d="M 8 85 Q 12 78 16 85 L 16 100 L 8 100 Z" fill={bgColor} />
              <Path d="M 20 85 Q 24 78 28 85 L 28 100 L 20 100 Z" fill={bgColor} />
              <Path d="M 32 85 Q 36 78 40 85 L 40 100 L 32 100 Z" fill={bgColor} />
              
              {/* Steeple Window */}
              <Path d="M 48 70 Q 52.5 60 57 70 L 57 90 L 48 90 Z" fill={bgColor} />
              
            </Svg>
          </Animated.View>
        </View>
        
      </View>

      {/* BOTTOM SECTION: HolyWay full text and Tagline */}
      <View style={styles.bottomSection}>
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={[styles.mainBrandText, { color: logoColor }]}>HolyWay</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
          {/* Muted Gold Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: mutedGold }]} />
            <View style={[styles.dividerDiamond, { backgroundColor: mutedGold }]} />
            <View style={[styles.dividerLine, { backgroundColor: mutedGold }]} />
          </View>
          
          <Text style={[styles.taglineText, { color: isDark ? warmIvory : deepEspresso }]}>
            Find your way to worship.
          </Text>
        </Animated.View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 260,
    height: 150,
    position: 'relative',
  },
  arcContainer: {
    position: 'absolute',
    bottom: -15, // Align arc near the base of the elements
    left: 0,
    right: 0,
  },
  crossContainer: {
    position: 'absolute',
    left: 20,
    bottom: 15,
  },
  olyWayContainer: {
    position: 'absolute',
    left: 70, // Nestled closely to the cross 'H'
    bottom: 22,
  },
  olyWayText: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 48,
    letterSpacing: -1,
  },
  churchClipContainer: {
    position: 'absolute',
    right: 30,
    bottom: 20,
    width: 80,
    height: 120,
    overflow: 'hidden', // Crucial for bottom-to-top reveal
  },
  bottomSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  mainBrandText: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 36,
    letterSpacing: 1,
    marginBottom: 16,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    width: 30,
    height: 1,
    opacity: 0.6,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 8,
    opacity: 0.8,
  },
  taglineText: {
    fontFamily: 'Inter_400Regular', // Clean, readable sans-serif
    fontSize: 15,
    letterSpacing: 0.5,
    opacity: 0.9,
  }
});
