import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { AppText } from './AppText';
import { SkeletonImage } from './SkeletonImage';
import { getChurchImage } from '../utils/churchUtils';
import { getChurchStatus } from '../utils/timeUtils';

const getChurchTypeIcon = (type) => {
  switch(type) {
    case 'Parish': return 'account-group-outline';
    case 'Basilica': return 'cross';
    case 'Cathedral': return 'church';
    case 'Shrine': return 'candle';
    default: return 'church';
  }
};

export const ChurchCard = React.memo(({ church, onPress, style, isFavorite, onToggleFavorite }) => {
  const status = getChurchStatus(church.massTimings);

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <SkeletonImage 
          source={getChurchImage(church.image)} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <AppText variant="bodyMedium" style={styles.statusText}>{status.label}</AppText>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
        >
          <MaterialCommunityIcons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? theme.colors.primary : "#ffffff"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <AppText variant="headingMedium" color="primary" style={styles.name}>
          {church.name}
        </AppText>
        
        <View style={styles.pillContainer}>
          {church.churchType && (
            <View style={[styles.denominationPill, styles.typePill]}>
              <MaterialCommunityIcons 
                name={getChurchTypeIcon(church.churchType)} 
                size={12} 
                color={theme.colors.surface} 
                style={{ marginRight: 4 }}
              />
              <AppText variant="bodyMedium" color="surface" style={styles.denomination}>
                {church.churchType}
              </AppText>
            </View>
          )}
          <View style={styles.denominationPill}>
            <AppText variant="bodyMedium" color="secondary" style={styles.denomination}>
              {church.denomination}
            </AppText>
          </View>
        </View>

        <AppText variant="body" color="textLight">
          {church.city}
        </AppText>
        
        {church.distance !== undefined && (
          <AppText variant="bodyMedium" color="primary" style={styles.distance}>
            {church.distance}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.3)',
    overflow: 'hidden', // to round image corners
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  content: {
    padding: theme.spacing.lg,
  },
  name: {
    marginBottom: theme.spacing.xs,
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  denominationPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(210, 180, 140, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  typePill: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  denomination: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
  },
  distance: {
    marginTop: theme.spacing.xs,
    fontWeight: 'bold',
  }
});
