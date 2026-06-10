import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [preferences, setPreferences] = useState({ denomination: null, language: null, distance: null, serviceTime: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const favsStr = await AsyncStorage.getItem('@favorites');
      if (favsStr) setFavorites(JSON.parse(favsStr));

      const recentsStr = await AsyncStorage.getItem('@recentlyViewed');
      if (recentsStr) setRecentlyViewed(JSON.parse(recentsStr));

      const prefsStr = await AsyncStorage.getItem('@preferences');
      if (prefsStr) setPreferences(JSON.parse(prefsStr));
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  };

  const toggleFavorite = async (churchId) => {
    try {
      const newFavs = favorites.includes(churchId)
        ? favorites.filter(id => id !== churchId)
        : [...favorites, churchId];
      
      setFavorites(newFavs);
      await AsyncStorage.setItem('@favorites', JSON.stringify(newFavs));
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  const addRecentlyViewed = async (churchId) => {
    try {
      // Remove if already exists, then add to front
      const filtered = recentlyViewed.filter(id => id !== churchId);
      const newRecents = [churchId, ...filtered].slice(0, 10); // keep max 10
      
      setRecentlyViewed(newRecents);
      await AsyncStorage.setItem('@recentlyViewed', JSON.stringify(newRecents));
    } catch (e) {
      console.error('Failed to add recently viewed', e);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      await AsyncStorage.setItem('@preferences', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update preferences', e);
    }
  };

  return (
    <UserDataContext.Provider value={{ favorites, toggleFavorite, recentlyViewed, addRecentlyViewed, preferences, updatePreferences }}>
      {children}
    </UserDataContext.Provider>
  );
};

