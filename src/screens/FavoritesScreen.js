import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppText } from '../components/AppText';
import { ChurchCard } from '../components/ChurchCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { getChurches } from '../services/churchService';
import { useTheme } from '../theme/ThemeContext';
import { UserDataContext } from '../context/UserDataContext';

export const FavoritesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [churches, setChurches] = useState([]);
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
    } catch (error) {
      console.error("Failed to load churches", error);
    } finally {
      setLoading(false);
    }
  };

  const favoriteChurches = churches?.filter(c => favorites?.includes(c.id));

  const renderHeader = () => (
    <View style={styles.header}>
      <AppText variant="heading" color="primary" style={styles.title}>
        Saved Churches
      </AppText>
      <AppText variant="body" color="textLight" style={styles.subtitle}>
        Your personal collection of favored parishes.
      </AppText>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <EmptyState 
        icon="heart-outline" 
        message="No favorite churches yet" 
        subtitle="Save churches to quickly access them later." 
        fullScreen={false} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && churches.length === 0 ? (
          <LoadingState message="Loading favorites..." />
        ) : (
          <FlatList
            data={favoriteChurches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChurchCard 
                church={item} 
                isFavorite={favorites?.includes(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
                onPress={() => navigation.navigate('ChurchDetails', { church: item })}
                showNextService={true}
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xxl,
  }
});
