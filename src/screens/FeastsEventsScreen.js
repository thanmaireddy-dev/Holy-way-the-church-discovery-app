import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Linking, Animated, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { SkeletonImage } from '../components/SkeletonImage';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { useTheme } from '../theme/ThemeContext';
import { getChurches } from '../services/churchService';
import { getChurchImage } from '../utils/churchUtils';
import { getFeastCountdown } from '../utils/feastCalculator';

// Local Festive Palette
const FESTIVE_PALETTE = {
  gold: '#D4AF37',
  amber: '#FFBF00',
  burgundy: '#9B2D30',
  terracotta: '#E2725B',
  cream: '#FAF8F5',
  deepBrown: '#3E2723',
};

const getChurchTypeIcon = (type) => {
  switch(type) {
    case 'Parish': return 'account-group-outline';
    case 'Basilica': return 'cross';
    case 'Cathedral': return 'church';
    case 'Shrine': return 'candle';
    default: return 'church';
  }
};

const FeastCard = React.memo(({ church, feastData, onPressDetails, theme }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isDark = theme.isDark;

  useEffect(() => {
    if (feastData.isToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [feastData.isToday]);

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`${church.name} Feast Celebration`);
    const location = encodeURIComponent(`${church.address || ''}, ${church.city || ''}`);
    const details = encodeURIComponent(`Feast celebration at ${church.name}`);
    
    const d = feastData.feastDate;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
    Linking.openURL(url);
  };

  let pillBg = FESTIVE_PALETTE.gold;
  let pillText = FESTIVE_PALETTE.deepBrown;
  let countdownText = `${feastData.daysRemaining} Days Remaining`;

  if (feastData.isToday) {
    pillBg = FESTIVE_PALETTE.burgundy;
    pillText = '#FFFFFF';
    countdownText = 'Feast Day Today';
  } else if (feastData.isTomorrow) {
    pillBg = FESTIVE_PALETTE.amber;
    countdownText = '1 Day Remaining';
  }

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: isDark ? '#2A2420' : '#FCFBF8', borderColor: isDark ? '#4A3B32' : '#E8DCC4' }]} 
      onPress={onPressDetails}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <SkeletonImage 
          source={getChurchImage(church.image)} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        
        {/* Feast Date overlay text */}
        <View style={styles.dateBadge}>
          <MaterialCommunityIcons name="calendar-heart" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <AppText variant="bodyMedium" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            {feastData.formattedDate}
          </AppText>
        </View>
      </View>

      <View style={styles.cardContent}>
        {/* Animated Countdown Pill as Hero Element */}
        <View style={styles.pillRow}>
          <Animated.View style={[
            styles.countdownPill, 
            { backgroundColor: pillBg, transform: [{ scale: pulseAnim }] }
          ]}>
            <AppText variant="bodyMedium" style={{ color: pillText, fontWeight: 'bold' }}>
              {countdownText}
            </AppText>
          </Animated.View>
        </View>

        <AppText variant="headingMedium" color="primary" style={styles.churchName}>
          {church.name}
        </AppText>

        <View style={styles.metaRow}>
          {church.churchType && (
            <View style={styles.typePill}>
              <MaterialCommunityIcons 
                name={getChurchTypeIcon(church.churchType)} 
                size={14} 
                color={theme.colors.surface} 
                style={{ marginRight: 4 }}
              />
              <AppText variant="bodyMedium" color="surface" style={styles.typeText}>
                {church.churchType}
              </AppText>
            </View>
          )}
          <AppText variant="bodyMedium" color="textLight">
            {church.city}
          </AppText>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
            <MaterialCommunityIcons name="calendar-plus" size={18} color={FESTIVE_PALETTE.deepBrown} style={{ marginRight: 6 }} />
            <AppText variant="bodyMedium" style={styles.calendarButtonText}>Add To Calendar</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export const FeastsEventsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [feasts, setFeasts] = useState([]);

  useEffect(() => {
    loadFeasts();
  }, []);

  const loadFeasts = async () => {
    try {
      setLoading(true);
      const allChurches = await getChurches();
      
      const upcomingFeasts = [];

      for (const church of allChurches) {
        // Safe check for feastDay and Catholic denomination
        if (church?.denomination === 'Catholic' && church?.feastDay) {
          const parsed = getFeastCountdown(church.feastDay);
          
          if (parsed && !parsed.hasPassed) {
            upcomingFeasts.push({
              church,
              feastData: parsed
            });
          }
        }
      }

      // Sort by closest date
      upcomingFeasts.sort((a, b) => a.feastData.daysRemaining - b.feastData.daysRemaining);
      
      setFeasts(upcomingFeasts);
    } catch (error) {
      console.error("Error loading feasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.heroBanner, { backgroundColor: theme.isDark ? '#3E2723' : FESTIVE_PALETTE.cream }]}>
      <MaterialCommunityIcons name="church" size={32} color={theme.isDark ? FESTIVE_PALETTE.gold : FESTIVE_PALETTE.terracotta} style={{ marginBottom: 8 }} />
      <AppText variant="headingLarge" style={{ color: theme.isDark ? FESTIVE_PALETTE.gold : FESTIVE_PALETTE.deepBrown }}>
        Upcoming Feasts & Celebrations
      </AppText>
      <AppText variant="body" style={[styles.heroSubtitle, { color: theme.isDark ? '#E8DCC4' : '#5D4037' }]}>
        Discover parish feasts, shrine celebrations, and upcoming events across Telangana.
      </AppText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState 
        icon="bell-outline"
        message="No upcoming feast celebrations at the moment."
        subtitle="Check back soon for upcoming parish celebrations and events."
        fullScreen={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {loading ? (
          <LoadingState message="Discovering upcoming feasts..." />
        ) : (
          <FlatList
            data={feasts}
            keyExtractor={(item) => item.church.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <FeastCard 
                church={item.church}
                feastData={item.feastData}
                theme={theme}
                onPressDetails={() => navigation.navigate('ChurchDetails', { church: item.church })}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)', // Soft gold border
  },
  heroSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyContainer: {
    marginTop: 40,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    padding: 20,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  countdownPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  churchName: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8C5A41', // HolyWay primary brown-ish
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  typeText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(210, 180, 140, 0.2)',
    paddingTop: 16,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FESTIVE_PALETTE.cream,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: FESTIVE_PALETTE.gold,
  },
  calendarButtonText: {
    color: FESTIVE_PALETTE.deepBrown,
    fontWeight: 'bold',
  }
});
