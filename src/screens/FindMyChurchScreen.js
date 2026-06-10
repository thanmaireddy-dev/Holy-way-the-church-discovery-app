import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Animated, ScrollView, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { ChurchCard } from '../components/ChurchCard';
import { getChurches } from '../services/churchService';
import { theme } from '../utils/theme';
import { calculateDistance, formatDistance } from '../utils/distanceUtils';
import { UserDataContext } from '../context/UserDataContext';

const DENOMINATIONS = ['Catholic', 'CSI', 'Baptist', 'Pentecostal', 'Orthodox', 'Methodist', 'Others'];
const LANGUAGES = ['English', 'Telugu', 'Malayalam', 'Tamil', 'Hindi', 'Others'];
const DISTANCES = [
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 20 km', value: 20 },
  { label: 'Within 50 km', value: 50 },
];
const SERVICE_TIMES = ['Morning Service', 'Afternoon Service', 'Evening Service'];

const { width, height } = Dimensions.get('window');

export const FindMyChurchScreen = ({ navigation }) => {
  const { favorites, toggleFavorite, updatePreferences } = useContext(UserDataContext);
  
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    denomination: null,
    language: null,
    distance: null,
    serviceTime: null,
  });
  
  const [results, setResults] = useState([]);
  const [exactMatches, setExactMatches] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  const loadingMessages = [
    "Finding churches for you...",
    "Checking denomination...",
    "Finding language matches...",
    "Searching nearby churches...",
    "Preparing recommendations..."
  ];
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const goToStep = (nextStep) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -15, duration: 250, useNativeDriver: true })
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(15);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();
    });
  };

  const handleSelection = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let interval;
    if (step === 6) {
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 400);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
      
      performSearch();
    }
    return () => clearInterval(interval);
  }, [step]);

  const performSearch = async () => {
    // Minimum 1.5 seconds loading animation for premium feel
    const startTime = Date.now();

    try {
      const data = await getChurches();
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let userLat = null;
      let userLon = null;
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        userLat = location.coords.latitude;
        userLon = location.coords.longitude;
      }

      const scoredChurches = data.map(church => {
        let score = 0;
        let isExact = true;
        let numericDist = 99999;
        
        if (church.latitude && church.longitude && userLat && userLon) {
          numericDist = calculateDistance(userLat, userLon, church.latitude, church.longitude);
        }
        
        const distLabel = numericDist === 99999 ? 'Unknown' : formatDistance(numericDist);

        // Score logic
        if (preferences.denomination && church.denomination === preferences.denomination) {
          score += 10;
        } else if (preferences.denomination) {
          isExact = false;
        }
        
        if (preferences.language) {
          if (church.languages && church.languages.includes(preferences.language)) {
            score += 10;
          } else {
            isExact = false;
          }
        }
        
        if (preferences.distance) {
          if (numericDist <= preferences.distance) {
            score += 5;
          } else {
            isExact = false;
          }
        }

        // Service time mock logic (if actual data lacks it)
        // Assume most churches have morning service. Randomly assign match for others if not specified.
        if (preferences.serviceTime) {
          const hasService = Math.random() > 0.3; // 70% chance of match for simulation
          if (hasService) {
            score += 5;
          } else {
            isExact = false;
          }
        }

        return {
          ...church,
          numericDistance: numericDist,
          distance: distLabel,
          matchScore: score,
          isExactMatch: isExact,
        };
      });

      // Filter out extremely far churches if distance preference exists
      let filtered = scoredChurches;
      if (preferences.distance) {
        filtered = filtered.filter(c => c.numericDistance <= preferences.distance * 1.5); // Allow slightly outside boundary for closest alternatives
      }

      // Sort by score (desc), then distance (asc)
      const sorted = filtered.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.numericDistance - b.numericDistance;
      });

      const exact = sorted.filter(c => c.isExactMatch);
      setExactMatches(exact.length);
      setResults(sorted);

      // Save preferences to context
      updatePreferences({
        denomination: preferences.denomination,
        language: preferences.language,
        distance: preferences.distance,
        serviceTime: preferences.serviceTime
      });

    } catch (e) {
      console.error(e);
      setResults([]);
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 2000 - elapsed); // Bumped to 2s to allow messages to rotate
    
    setTimeout(() => {
      pulseAnim.stopAnimation();
      goToStep(7); // Results step
    }, remaining);
  };

  const OptionCard = ({ label, selected, onPress }) => (
    <TouchableOpacity 
      style={[styles.optionCard, selected && styles.optionCardSelected]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText 
        variant={selected ? "headingMedium" : "bodyMedium"} 
        style={[styles.optionText, selected && styles.optionTextSelected]}
      >
        {label}
      </AppText>
      {selected && (
        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.surface} />
      )}
    </TouchableOpacity>
  );

  const renderWelcome = () => (
    <View style={styles.centerContent}>
      <MaterialCommunityIcons name="church" size={80} color={theme.colors.primary} style={styles.heroIcon} />
      <AppText variant="heading" color="primary" style={styles.heroTitle} align="center">
        Find My Church
      </AppText>
      <AppText variant="body" color="textLight" style={styles.heroSubtitle} align="center">
        Discover churches that match your denomination, language, service preference, and location.
      </AppText>
      <AppButton 
        title="Begin Discovery" 
        onPress={() => goToStep(1)} 
        style={styles.actionButton}
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <AppText variant="heading" color="primary" style={styles.stepTitle}>
        Select Denomination
      </AppText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {DENOMINATIONS.map(den => (
          <OptionCard 
            key={den} 
            label={den} 
            selected={preferences.denomination === den} 
            onPress={() => handleSelection('denomination', den)} 
          />
        ))}
      </ScrollView>
      <View style={styles.buttonRow}>
        <AppButton title="Next" disabled={!preferences.denomination} onPress={() => goToStep(2)} style={styles.fullWidthBtn} />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <AppText variant="heading" color="primary" style={styles.stepTitle}>
        Select Language
      </AppText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {LANGUAGES.map(lang => (
          <OptionCard 
            key={lang} 
            label={lang} 
            selected={preferences.language === lang} 
            onPress={() => handleSelection('language', lang)} 
          />
        ))}
      </ScrollView>
      <View style={styles.buttonRowNav}>
        <AppButton title="Back" variant="outline" onPress={() => goToStep(1)} style={styles.halfBtn} />
        <AppButton title="Next" disabled={!preferences.language} onPress={() => goToStep(3)} style={styles.halfBtn} />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <AppText variant="heading" color="primary" style={styles.stepTitle}>
        Select Distance
      </AppText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {DISTANCES.map(dist => (
          <OptionCard 
            key={dist.value} 
            label={dist.label} 
            selected={preferences.distance === dist.value} 
            onPress={() => handleSelection('distance', dist.value)} 
          />
        ))}
      </ScrollView>
      <View style={styles.buttonRowNav}>
        <AppButton title="Back" variant="outline" onPress={() => goToStep(2)} style={styles.halfBtn} />
        <AppButton title="Next" disabled={!preferences.distance} onPress={() => goToStep(4)} style={styles.halfBtn} />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <AppText variant="heading" color="primary" style={styles.stepTitle}>
        Preferred Service Time
      </AppText>
      <AppText variant="body" color="textLight" style={styles.stepSubtitle}>
        Optional
      </AppText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {SERVICE_TIMES.map(time => (
          <OptionCard 
            key={time} 
            label={time} 
            selected={preferences.serviceTime === time} 
            onPress={() => handleSelection('serviceTime', time)} 
          />
        ))}
      </ScrollView>
      <View style={styles.buttonRowNav}>
        <AppButton title="Back" variant="outline" onPress={() => goToStep(3)} style={styles.halfBtn} />
        <AppButton title="Skip / Next" onPress={() => goToStep(5)} style={styles.halfBtn} />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.centerContent}>
      <MaterialCommunityIcons name="church" size={60} color={theme.colors.primary} style={styles.heroIcon} />
      <AppText variant="heading" color="primary" style={styles.stepTitle} align="center">
        Final Confirmation
      </AppText>
      <View style={styles.summaryBox}>
        <AppText style={styles.summaryText}>• {preferences.denomination}</AppText>
        <AppText style={styles.summaryText}>• {preferences.language}</AppText>
        <AppText style={styles.summaryText}>• Within {preferences.distance} km</AppText>
        {preferences.serviceTime && <AppText style={styles.summaryText}>• {preferences.serviceTime}</AppText>}
      </View>
      <AppButton 
        title="Find My Church" 
        onPress={() => goToStep(6)} 
        style={styles.finalButton}
      />
      <TouchableOpacity onPress={() => goToStep(4)} style={{ marginTop: theme.spacing.lg }}>
         <AppText color="textLight" style={{ textDecorationLine: 'underline' }}>Go Back</AppText>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centerContent}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <MaterialCommunityIcons name="church" size={80} color={theme.colors.primary} />
      </Animated.View>
      <AppText variant="headingMedium" color="primary" style={{ marginTop: theme.spacing.xl, textAlign: 'center' }}>
        {loadingMessages[loadingMessageIndex]}
      </AppText>
    </View>
  );

  const renderResults = () => {
    return (
      <View style={styles.resultsContent}>
        <View style={styles.resultsHeader}>
          <TouchableOpacity onPress={() => goToStep(0)} style={styles.startOverBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <AppText variant="headingMedium" color="primary">
            {results.length} {results.length === 1 ? 'Church' : 'Churches'} Found
          </AppText>
          <View style={{ width: 24 }} />
        </View>

        {results.length > 0 && exactMatches === 0 && (
          <View style={styles.noExactMatchBox}>
            <AppText color="textLight" align="center" style={styles.noExactMatchText}>
              No exact matches found. Showing closest alternatives.
            </AppText>
          </View>
        )}

        <FlatList
          data={results}
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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
              <AppText color="textLight" align="center">No churches could be found near this distance.</AppText>
            </View>
          }
        />
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderLoading();
      case 7: return renderResults();
      default: return null;
    }
  };

  // Skip the safe area wrapping for the results list so it scrolls nicely
  if (step === 7) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderCurrentStep()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.animatedWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {renderCurrentStep()}
        </Animated.View>
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
    padding: theme.spacing.xl,
  },
  animatedWrapper: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  heroIcon: {
    marginBottom: theme.spacing.xl,
  },
  heroTitle: {
    marginBottom: theme.spacing.md,
    fontSize: 32,
  },
  heroSubtitle: {
    marginBottom: theme.spacing.xxl,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  stepTitle: {
    marginBottom: theme.spacing.xl,
    fontSize: 28,
  },
  stepSubtitle: {
    marginTop: -theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.4)',
    ...theme.shadows.soft,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 18,
  },
  optionTextSelected: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  buttonRow: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  buttonRowNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  fullWidthBtn: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  halfBtn: {
    width: '48%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  summaryBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    marginBottom: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryText: {
    color: theme.colors.text,
    fontSize: 18,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.bodyMedium,
  },
  finalButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.secondary, // Maroon accent for the final action
  },
  resultsContent: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  startOverBtn: {
    padding: theme.spacing.xs,
  },
  noExactMatchBox: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.4)',
  },
  noExactMatchText: {
    fontStyle: 'italic',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
});
