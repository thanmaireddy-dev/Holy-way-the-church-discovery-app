import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { AppText } from '../components/AppText';
import { ChurchCard } from '../components/ChurchCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { getChurches } from '../services/churchService';
import { useTheme } from '../theme/ThemeContext';
import { UserDataContext } from '../context/UserDataContext';

const LANGUAGES = ['English', 'Telugu', 'Tamil', 'Malayalam', 'Hindi'];

export const LanguagesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [churches, setChurches] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useContext(UserDataContext);

  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await getChurches();
      setChurches(data);
      applyFilter('English', data);
    } catch (error) {
      console.error("Failed to load churches", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (language, allChurches = churches) => {
    const filtered = allChurches?.filter(c => 
      c?.languages?.some(l => l.toLowerCase() === language.toLowerCase())
    );
    setFilteredChurches(filtered);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    applyFilter(language);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <AppText variant="heading" color="primary" style={styles.title}>
        Discover by Language
      </AppText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {LANGUAGES.map(lang => (
          <TouchableOpacity 
            key={lang} 
            style={[styles.filterChip, selectedLanguage === lang && styles.filterChipSelected]}
            onPress={() => handleLanguageSelect(lang)}
          >
            <AppText 
              variant="bodyMedium" 
              color={selectedLanguage === lang ? 'surface' : 'primary'}
            >
              {lang}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <EmptyState 
        icon="translate-off" 
        message={`No churches found`} 
        subtitle={`No churches currently offer services in ${selectedLanguage}.`} 
        fullScreen={false} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && churches.length === 0 ? (
          <LoadingState message="Loading languages..." />
        ) : (
          <FlatList
            data={filteredChurches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChurchCard 
                church={item} 
                isFavorite={favorites?.includes(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
                onPress={() => navigation.navigate('ChurchDetails', { church: item })}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader()}
            ListEmptyComponent={renderEmptyComponent()}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  filterContainer: {
    marginBottom: theme.spacing.sm,
  },
  filterContent: {
    paddingVertical: theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  }
});
