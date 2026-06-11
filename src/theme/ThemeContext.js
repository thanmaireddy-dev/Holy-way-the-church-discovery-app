import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' or 'dark'
  const [appTheme, setAppTheme] = useState('system'); // 'system', 'light', 'dark'
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        if (storedTheme) {
          setAppTheme(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  const handleSetAppTheme = async (newTheme) => {
    setAppTheme(newTheme);
    try {
      await AsyncStorage.setItem('@theme_preference', newTheme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const currentTheme = useMemo(() => {
    const effectiveTheme = appTheme === 'system' ? (systemColorScheme || 'light') : appTheme;
    return effectiveTheme === 'dark' ? darkTheme : lightTheme;
  }, [appTheme, systemColorScheme]);

  if (!isReady) {
    return null; // Don't render until theme is loaded to prevent flashes
  }

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      isDark: currentTheme.isDark,
      appTheme,
      setAppTheme: handleSetAppTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
