import { shared } from './shared';

export const lightTheme = {
  isDark: false,
  colors: {
    primary: '#4A2511', // Dark wood brown / Chocolate
    secondary: '#800020', // Burgundy / Wine Red
    background: '#F5F5DC', // Beige / Warm Ivory
    surface: '#FFFDD0', // Cream / Parchment
    text: '#2C1E16', // Very dark brown for text
    textLight: '#6B4E31',
    border: '#D2B48C', // Soft tan / brassy
    white: '#FFFFFF',
    error: '#B22222', // Muted red
  },
  ...shared,
  shadows: {
    soft: {
      ...shared.shadows.soft,
      shadowColor: '#4A2511',
    },
    medium: {
      ...shared.shadows.medium,
      shadowColor: '#4A2511',
    }
  }
};
