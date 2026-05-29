export const theme = {
  colors: {
    primary: '#4A2511', // Dark wood brown / Chocolate
    secondary: '#800020', // Burgundy / Wine Red
    background: '#F5F5DC', // Beige / Warm Ivory
    surface: '#FFFDD0', // Cream / Parchment
    text: '#2C1E16', // Very dark brown for text (softer than pure black)
    textLight: '#6B4E31',
    border: '#D2B48C', // Soft tan / brassy color for subtle borders
    white: '#FFFFFF',
    error: '#B22222', // Muted red for errors
  },
  typography: {
    // We will load these fonts in App.js
    heading: 'PlayfairDisplay_700Bold',
    headingMedium: 'PlayfairDisplay_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    soft: {
      shadowColor: '#4A2511',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#4A2511',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    }
  }
};
