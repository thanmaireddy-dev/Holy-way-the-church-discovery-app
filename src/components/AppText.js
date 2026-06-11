import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const AppText = ({ 
  children, 
  style, 
  variant = 'body', 
  color = 'text',
  align = 'left',
  ...props 
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <Text 
      style={[
        styles.base,
        styles[variant],
        { color: theme.colors[color], textAlign: align },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const getStyles = (theme) => StyleSheet.create({
  base: {
    fontFamily: theme.typography.body,
  },
  body: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  heading: {
    fontFamily: theme.typography.heading,
    fontSize: 32,
    lineHeight: 40,
  },
  headingMedium: {
    fontFamily: theme.typography.headingMedium,
    fontSize: 24,
    lineHeight: 32,
  },
  caption: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    lineHeight: 20,
  }
});
