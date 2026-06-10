import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { theme } from '../utils/theme';

export const SkeletonImage = ({ source, style, resizeMode = "cover" }) => {
  const [loaded, setLoaded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let animation;
    if (!loaded) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [loaded, pulseAnim]);

  return (
    <View style={[styles.container, style]}>
      {!loaded && (
        <Animated.View 
          style={[
            styles.skeleton, 
            { opacity: pulseAnim }
          ]} 
        />
      )}
      <Image 
        source={source} 
        style={[styles.image, { opacity: loaded ? 1 : 0 }]} 
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(210, 180, 140, 0.2)', // soft beige placeholder background
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(210, 180, 140, 0.4)', // slightly darker beige for the pulse
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
