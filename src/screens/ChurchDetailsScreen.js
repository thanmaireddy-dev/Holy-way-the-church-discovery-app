import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Linking, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { theme } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getChurchImage, getTimingLabel } from '../utils/churchUtils';
import { getChurchStatus } from '../utils/timeUtils';
import { UserDataContext } from '../context/UserDataContext';
import { scheduleReminder } from '../utils/notificationUtils';

export const ChurchDetailsScreen = ({ route, navigation }) => {
  const { church } = route.params;
  const { favorites, toggleFavorite, addRecentlyViewed } = useContext(UserDataContext);
  
  const isFavorite = favorites?.includes(church.id);
  const status = getChurchStatus(church.massTimings);

  useEffect(() => {
    addRecentlyViewed(church.id);
  }, []);

  const openInMaps = () => {
    if (church.mapsUrl && church.mapsUrl.startsWith('http')) {
      Linking.openURL(church.mapsUrl);
      return;
    }
    const query = church.googleMapsQuery || `${church.name} ${church.city} ${church.address}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(url);
      }
    }).catch(err => console.error("Error opening map", err));
  };

  const handleRemindMe = async (title, body) => {
    const success = await scheduleReminder(title, body);
    if (success) {
      // Small alert for demo purposes
      Alert.alert("Reminder Set", `You will be reminded about ${title}.`);
    } else {
      Alert.alert("Permission Required", "Please enable notifications to set reminders.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.imageContainer}>
          <Image source={getChurchImage(church.image)} style={styles.image} resizeMode="cover" />
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <AppText variant="bodyMedium" style={styles.statusText}>{status.label}</AppText>
          </View>
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(church.id)}>
            <MaterialCommunityIcons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? theme.colors.primary : "#ffffff"} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <AppText variant="heading" color="primary" style={styles.name}>
            {church.name}
          </AppText>
          <View style={styles.pillContainer}>
            {church.churchType && (
              <View style={[styles.denominationPill, styles.typePill]}>
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

          {church.description ? (
            <AppText variant="body" color="text" style={styles.description}>
              {church.description}
            </AppText>
          ) : null}

          <View style={styles.divider} />

          <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
            {getTimingLabel(church.denomination)}
          </AppText>
          <View style={styles.timingsContainer}>
            {church.massTimings?.sunday?.length > 0 && (
              <View style={styles.timingRow}>
                <AppText variant="bodyMedium" color="text" style={styles.timingDay}>Sunday</AppText>
                <AppText variant="body" color="textLight" style={styles.timingHours}>{church.massTimings.sunday.join(', ')}</AppText>
              </View>
            )}
            {church.massTimings?.weekday?.length > 0 && (
              <View style={styles.timingRow}>
                <AppText variant="bodyMedium" color="text" style={styles.timingDay}>Weekday</AppText>
                <AppText variant="body" color="textLight" style={styles.timingHours}>{church.massTimings.weekday.join(', ')}</AppText>
              </View>
            )}
            {church.massTimings?.saturday?.length > 0 && (
              <View style={styles.timingRow}>
                <AppText variant="bodyMedium" color="text" style={styles.timingDay}>Saturday</AppText>
                <AppText variant="body" color="textLight" style={styles.timingHours}>{church.massTimings.saturday.join(', ')}</AppText>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color={theme.colors.primary} style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <AppText variant="bodyMedium" color="text">Address</AppText>
              <AppText variant="body" color="textLight">{church.address}</AppText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone-outline" size={24} color={theme.colors.primary} style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <AppText variant="bodyMedium" color="text">Contact</AppText>
              <AppText variant="body" color="textLight">{church.phone || 'Not available'}</AppText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="translate" size={24} color={theme.colors.primary} style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <AppText variant="bodyMedium" color="text">Languages</AppText>
              <AppText variant="body" color="textLight">
                {church.languages && church.languages.length > 0 ? church.languages.join(', ') : 'Not specified'}
              </AppText>
            </View>
          </View>

          {church.parishPriest && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-tie-outline" size={24} color={theme.colors.primary} style={styles.icon} />
              <View style={styles.infoTextContainer}>
                <AppText variant="bodyMedium" color="text">Parish Priest</AppText>
                <AppText variant="body" color="textLight">{church.parishPriest}</AppText>
              </View>
            </View>
          )}

          {church.patron && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="shield-cross-outline" size={24} color={theme.colors.primary} style={styles.icon} />
              <View style={styles.infoTextContainer}>
                <AppText variant="bodyMedium" color="text">Patron</AppText>
                <AppText variant="body" color="textLight">{church.patron}</AppText>
              </View>
            </View>
          )}

          {church.feastDay && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-star" size={24} color={theme.colors.primary} style={styles.icon} />
              <View style={styles.infoTextContainer}>
                <AppText variant="bodyMedium" color="text">Feast Day</AppText>
                <AppText variant="body" color="textLight">{church.feastDay}</AppText>
              </View>
            </View>
          )}

          {church.website && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="web" size={24} color={theme.colors.primary} style={styles.icon} />
              <View style={styles.infoTextContainer}>
                <AppText variant="bodyMedium" color="text">Website</AppText>
                <AppText variant="body" color="textLight">{church.website}</AppText>
              </View>
            </View>
          )}

          <AppButton 
            title="Open in Maps" 
            onPress={openInMaps}
            style={styles.mapButton}
          />

          {church.events && church.events.length > 0 && (
            <>
              <View style={styles.divider} />
              <AppText variant="headingMedium" color="primary" style={styles.sectionTitle}>
                Upcoming Events
              </AppText>
              {church.events.map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <AppText variant="headingSmall" color="primary" style={styles.eventTitle}>{event.title}</AppText>
                    <AppText variant="bodyMedium" color="secondary" style={styles.eventDate}>{event.date}</AppText>
                  </View>
                  <AppText variant="body" color="text" style={styles.eventDescription}>{event.description}</AppText>
                  <TouchableOpacity 
                    style={styles.remindButton} 
                    onPress={() => handleRemindMe(event.title, `Upcoming event at ${church.name}: ${event.title}`)}
                  >
                    <MaterialCommunityIcons name="bell-ring-outline" size={16} color={theme.colors.primary} />
                    <AppText variant="bodyMedium" color="primary" style={styles.remindText}>Remind Me</AppText>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.suggestButton}
            onPress={() => navigation.navigate('SuggestCorrection', { church })}
          >
            <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.textLight} />
            <AppText variant="bodyMedium" color="textLight" style={styles.suggestText}>Suggest a Correction</AppText>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    ...theme.shadows.medium,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    ...theme.shadows.soft,
  },
  name: {
    marginBottom: theme.spacing.xs,
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
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
  },
  denomination: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
  },
  description: {
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  timingsContainer: {
    marginBottom: theme.spacing.md,
  },
  timingRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  timingDay: {
    width: 80,
  },
  timingHours: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  mapButton: {
    marginTop: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.2)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  eventTitle: {
    flex: 1,
  },
  eventDate: {
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  eventDescription: {
    marginBottom: theme.spacing.sm,
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(210, 180, 140, 0.15)',
    borderRadius: 16,
  },
  remindText: {
    marginLeft: theme.spacing.xs,
    fontSize: 12,
    fontWeight: 'bold',
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  suggestText: {
    marginLeft: theme.spacing.sm,
  }
});
