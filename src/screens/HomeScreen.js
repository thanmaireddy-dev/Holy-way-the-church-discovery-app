import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { ChurchCard } from '../components/ChurchCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { getChurches } from '../services/churchService';
import { useTheme } from '../theme/ThemeContext';
import { UserDataContext } from '../context/UserDataContext';
import { useDebounce } from '../utils/useDebounce';

const DENOMINATIONS = ['All', 'Catholic', 'CSI', 'Pentecostal', 'Baptist', 'Methodist', 'Orthodox'];
const CHURCH_TYPES = ['All', 'Basilica', 'Cathedral', 'Shrine', 'Parish'];

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [churches, setChurches] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDenomination, setSelectedDenomination] = useState('All');
  const [selectedChurchType, setSelectedChurchType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { favorites, toggleFavorite, recentlyViewed, preferences } = useContext(UserDataContext);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadChurches();
  }, []);

  const recommendedChurches = React.useMemo(() => {
    if (!preferences?.denomination && !preferences?.language) return [];
    let scoredRecs = churches?.map(c => {
      let score = 0;
      if (preferences.denomination && c.denomination === preferences.denomination) score += 10;
      if (preferences.language && c.languages?.includes(preferences.language)) score += 10;
      return { ...c, recScore: score };
    }).filter(c => c.recScore > 0 && !recentlyViewed?.includes(c.id));
    
    if (selectedDenomination !== 'All') {
      scoredRecs = scoredRecs.filter(c => c.denomination === selectedDenomination);
    }
    
    return scoredRecs.sort((a, b) => b.recScore - a.recScore).slice(0, 5);
  }, [churches, preferences, recentlyViewed, selectedDenomination]);

  const loadChurches = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getChurches();
      setChurches(data);
      setFilteredChurches(data);
    } catch (err) {
      console.error("Failed to load churches", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (query, denomination, churchType, allChurches) => {
    let filtered = allChurches;
    
    if (denomination !== 'All') {
      filtered = filtered.filter(c => c.denomination === denomination);
    }
    
    if (denomination === 'Catholic' && churchType !== 'All') {
      filtered = filtered.filter(c => c.churchType === churchType);
    }
    
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.city.toLowerCase().includes(lowerQuery) ||
        c.address.toLowerCase().includes(lowerQuery)
      );
    }
    
    setFilteredChurches(filtered);
  };

  useEffect(() => {
    if (churches.length > 0) {
      applyFilters(debouncedSearchQuery, selectedDenomination, selectedChurchType, churches);
    }
  }, [debouncedSearchQuery, selectedDenomination, selectedChurchType, churches]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleDenominationSelect = (denomination) => {
    setSelectedDenomination(denomination);
    if (denomination !== 'Catholic') {
      setSelectedChurchType('All');
    }
  };

  const handleChurchTypeSelect = (churchType) => {
    setSelectedChurchType(churchType);
  };

  const recentChurches = React.useMemo(() => {
    let recent = recentlyViewed?.map(id => churches?.find(c => c.id === id)).filter(Boolean) || [];
    if (selectedDenomination !== 'All') {
      recent = recent.filter(c => c.denomination === selectedDenomination);
    }
    return recent;
  }, [recentlyViewed, churches, selectedDenomination]);

  const renderHeader = () => (
    <View style={styles.header}>
      <AppText variant="heading" color="primary" style={styles.title}>
        Discover Churches
      </AppText>
      <AppTextInput
        placeholder="Search by name, area, or city..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {DENOMINATIONS.map(den => (
          <TouchableOpacity 
            key={den} 
            style={[styles.filterChip, selectedDenomination === den && styles.filterChipSelected]}
            onPress={() => handleDenominationSelect(den)}
          >
            <AppText 
              variant="bodyMedium" 
              color={selectedDenomination === den ? 'surface' : 'primary'}
            >
              {den}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedDenomination === 'Catholic' && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {CHURCH_TYPES.map(type => (
            <TouchableOpacity 
              key={type} 
              style={[
                styles.filterChip, 
                styles.secondaryFilterChip,
                selectedChurchType === type && styles.filterChipSelected,
                selectedChurchType === type && styles.secondaryFilterChipSelected
              ]}
              onPress={() => handleChurchTypeSelect(type)}
            >
              <AppText 
                variant="bodyMedium" 
                color={selectedChurchType === type ? 'surface' : 'primary'}
                style={styles.secondaryFilterText}
              >
                {type}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    if (error) {
      return (
        <EmptyState 
          icon="wifi-off" 
          message="You're currently offline" 
          subtitle="Please check your internet connection and try again." 
          actionLabel="Retry" 
          onAction={loadChurches}
          fullScreen={false}
        />
      );
    }

    return (
      <EmptyState 
        icon="church" 
        message="No exact matches found" 
        subtitle="Try changing your denomination, language, or distance preferences." 
        actionLabel="Clear Filters" 
        onAction={() => {
          setSearchQuery('');
          setSelectedDenomination('All');
          setSelectedChurchType('All');
        }}
        fullScreen={false}
      />
    );
  };

  const renderHorizontalSection = (title, data) => {
    // Don't show horizontal sections if user is actively searching
    if (searchQuery.trim() !== '') return null;
    // Don't show horizontal sections if any category filters are active
    if (selectedDenomination !== 'All' || selectedChurchType !== 'All') return null;

    if (!data || data.length === 0) {
      if (title === 'Recently Viewed') {
        return (
          <View style={styles.sectionContainer}>
            <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
              {title}
            </AppText>
            <View style={styles.horizontalEmptyBox}>
              <EmptyState 
                icon="church" 
                message="No recently viewed churches" 
                subtitle="Explore churches and they'll appear here." 
                fullScreen={false} 
              />
            </View>
          </View>
        );
      }
      return null;
    }

    return (
      <View style={styles.sectionContainer}>
        <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
          {title}
        </AppText>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalListContent}
          renderItem={({ item }) => (
            <ChurchCard 
              church={item} 
              style={styles.horizontalCard}
              isFavorite={favorites?.includes(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => navigation.navigate('ChurchDetails', { church: item })}
            />
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && churches.length === 0 ? (
          <LoadingState message="Loading churches..." />
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
            ListHeaderComponent={
              <>
                {renderHeader()}
                {renderHorizontalSection('Recently Viewed', recentChurches)}
                {renderHorizontalSection('Recommended for You', recommendedChurches)}
                <AppText variant="headingMedium" color="primary" style={styles.sectionTitleMain}>
                  {searchQuery.trim() ? 'Search Results' : 'Explore All'}
                </AppText>
              </>
            }
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
  searchBar: {
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
  secondaryFilterChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    borderWidth: 0.5,
    marginRight: theme.spacing.sm,
    opacity: 0.85,
  },
  secondaryFilterChipSelected: {
    opacity: 1,
  },
  secondaryFilterText: {
    fontSize: 13,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitleMain: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  horizontalListContent: {
    paddingBottom: theme.spacing.md,
  },
  horizontalCard: {
    width: 280,
    marginRight: theme.spacing.md,
    marginBottom: 0,
  },
  horizontalEmptyBox: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.isDark ? theme.colors.border : 'rgba(210, 180, 140, 0.3)',
    ...theme.shadows.soft,
  }
});
