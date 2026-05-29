import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { AppText } from '../components/AppText';
import { ChurchCard } from '../components/ChurchCard';
import { getChurches } from '../services/churchService';
import { theme } from '../utils/theme';
import { calculateDistance, formatDistance } from '../utils/distanceUtils';
import { UserDataContext } from '../context/UserDataContext';

export const NearMeScreen = ({ navigation }) => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const { favorites, toggleFavorite } = useContext(UserDataContext);

  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await getChurches();
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError("Location permission denied. Showing default order.");
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setChurches(shuffled);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLat = location.coords.latitude;
      const userLon = location.coords.longitude;

      const churchesWithDistance = data.map(church => {
        if (church.latitude && church.longitude) {
          const dist = calculateDistance(userLat, userLon, church.latitude, church.longitude);
          return { ...church, numericDistance: dist, distance: formatDistance(dist) };
        }
        return { ...church, numericDistance: 99999, distance: 'Unknown' };
      });

      const sorted = churchesWithDistance.sort((a, b) => a.numericDistance - b.numericDistance);
      setChurches(sorted);
    } catch (error) {
      console.error("Failed to load nearby churches", error);
      setLocationError("Could not determine location.");
      const data = await getChurches();
      setChurches(data);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <AppText variant="heading" color="primary" style={styles.title}>
        Nearby Churches
      </AppText>
      <AppText variant="body" color="textLight" style={styles.subtitle}>
        Discover parishes close to your current location.
      </AppText>
      {locationError && (
        <AppText variant="bodyMedium" style={{ color: theme.colors.error, marginTop: theme.spacing.sm }}>
          {locationError}
        </AppText>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={churches}
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
  }
});
