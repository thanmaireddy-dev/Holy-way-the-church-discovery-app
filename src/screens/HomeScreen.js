import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { ChurchCard } from '../components/ChurchCard';
import { getChurches } from '../services/churchService';
import { theme } from '../utils/theme';
import { UserDataContext } from '../context/UserDataContext';
import { useDebounce } from '../utils/useDebounce';

const DENOMINATIONS = ['All', 'Catholic', 'CSI', 'Pentecostal', 'Baptist', 'Methodist', 'Orthodox'];
const CHURCH_TYPES = ['All', 'Basilica', 'Cathedral', 'Shrine', 'Parish'];

export const HomeScreen = ({ navigation }) => {
  const [churches, setChurches] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDenomination, setSelectedDenomination] = useState('All');
  const [selectedChurchType, setSelectedChurchType] = useState('All');
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, recentlyViewed, preferences } = useContext(UserDataContext);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadChurches();
  }, []);

  const recommendedChurches = React.useMemo(() => {
    if (!preferences?.denomination && !preferences?.language) return [];
    return churches.filter(c => 
      (preferences.denomination && c.denomination === preferences.denomination) ||
      (preferences.language && c.languages?.includes(preferences.language))
    ).filter(c => !recentlyViewed?.includes(c.id)).slice(0, 5);
  }, [churches, preferences, recentlyViewed]);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await getChurches();
      setChurches(data);
      setFilteredChurches(data);
    } catch (error) {
      console.error("Failed to load churches", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (query, denomination, churchType, allChurches) => {
    let filtered = allChurches;
    
    if (denomination !== 'All') {
      filtered = filtered.filter(c => c.denomination === denomination);
    }
    
    if (churchType !== 'All') {
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
    return recentlyViewed?.map(id => churches.find(c => c.id === id)).filter(Boolean);
  }, [recentlyViewed, churches]);

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
    return (
      <View style={styles.emptyContainer}>
        <AppText color="textLight" align="center">
          No churches found matching your search.
        </AppText>
      </View>
    );
  };

  const renderHorizontalSection = (title, data) => {
    if (!data || data.length === 0) return null;
    // Don't show horizontal sections if user is actively searching
    if (searchQuery.trim() !== '') return null;

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
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
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

const styles = StyleSheet.create({
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
  }
});
