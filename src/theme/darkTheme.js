import { shared } from './shared';

export const darkTheme = {
  isDark: true,
  colors: {
    primary: '#C7A365', // Muted gold
    secondary: '#B07B55', // Soft bronze
    background: '#241712', // Deep espresso brown
    surface: '#2D2825', // Rich warm charcoal
    text: '#F2E8D9', // Warm cream text
    textLight: '#CBBDAE', // Softer warm cream
    border: '#453831', // Dark walnut
    white: '#FFFFFF',
    error: '#D26466', // Muted red
  },
  ...shared,
  shadows: {
    soft: {
      ...shared.shadows.soft,
      shadowColor: '#000000',
    },
    medium: {
      ...shared.shadows.medium,
      shadowColor: '#000000',
    }
  }
};
