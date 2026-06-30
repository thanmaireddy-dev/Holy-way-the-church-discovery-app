import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { AppText } from '../components/AppText';
import { useTheme } from '../theme/ThemeContext';
import appConfig from '../../app.json';

export const AboutScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const appVersion = appConfig?.expo?.version || '1.0.0';

  const cards = [
    {
      title: 'Why HolyWay Exists',
      content: "HolyWay began with a simple challenge.\n\nWhen I moved to Hyderabad for my B.Tech, finding a church wasn't as easy as opening a map. While maps could show nearby churches, they couldn't answer the questions that mattered most.\n\nIs this church Catholic, CSI, Pentecostal, Baptist, Methodist, or another denomination?\n\nWhich languages are used for worship?\n\nWhat time is the next Mass or service?\n\nIs the church active today?\n\nAs I started learning React Native, I decided to build a small project to solve this problem for myself. What began as a learning exercise slowly evolved into something much bigger.\n\nToday, HolyWay is growing into a platform that helps students, families, migrants, and working professionals discover church communities with confidence wherever life takes them."
    },
    {
      title: 'Our Mission',
      content: "HolyWay aims to make discovering churches simple, reliable, and welcoming.\n\nBy bringing together denomination information, worship languages, service timings, feast days, location details, and community recommendations, the app helps people spend less time searching and more time connecting with a church community.\n\nOur goal is to build one of the most accurate and thoughtfully curated church directories for everyone."
    },
    {
      title: 'Privacy',
      content: "Your privacy matters.\n\nHolyWay only stores the information necessary to provide its core features, such as authentication, favourites, preferences, and personalized recommendations.\n\nYour personal information is never sold to third parties. Location is accessed only when required for features such as nearby churches or church recommendations.\n\nAs HolyWay evolves, this privacy notice will continue to be updated to reflect new features and improvements."
    },
    {
      title: 'Acknowledgements',
      content: "HolyWay would not have been possible without the efforts of countless churches and organizations that make parish information publicly available.\n\nSpecial thanks to the Archdiocese of Hyderabad for providing publicly accessible parish information that helped establish the initial Catholic church database.\n\nAppreciation also goes to the open-source community and the developers behind React Native, Expo, Firebase, and many other tools that made this project possible."
    },
    {
      title: 'Built Using',
      content: "• React Native\n\n• Expo\n\n• Firebase Authentication\n\n• Cloud Firestore\n\n• Google Maps\n\n• Expo Notifications\n\n• Async Storage\n\nVersion:\nHolyWay v" + appVersion + " (automatic)"
    },
    {
      title: 'Contact',
      content: "Have feedback, found incorrect church information, or want to contribute?\n\nI'd love to hear from you.\n\n📧 thanmaireddy77@gmail.com"
    },
    {
      title: 'Data Accuracy',
      content: "HolyWay is an actively evolving platform.\n\nChurch information, Mass timings, feast schedules, contact details, and other information may occasionally change over time.\n\nWhile every effort is made to keep the information accurate, users are encouraged to verify important details directly with the respective church when planning a visit.\n\nIf you notice outdated or incorrect information, you can help improve HolyWay by submitting a correction through the app."
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <AppText variant="heading" color="primary" style={styles.mainHeading}>
            About HolyWay
          </AppText>
          <AppText variant="body" color="textLight" style={styles.subtitle}>
            Helping people discover churches,
          </AppText>
          <AppText variant="body" color="textLight" style={styles.subtitle}>
            strengthen faith,
          </AppText>
          <AppText variant="body" color="textLight" style={styles.subtitle}>
            and stay connected wherever life takes them.
          </AppText>
        </View>

        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <View key={index} style={styles.card}>
              <AppText variant="headingMedium" color="primary" style={styles.cardTitle}>
                {card.title}
              </AppText>
              <AppText variant="body" color="text" style={styles.cardContent}>
                {card.content}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <AppText variant="bodyMedium" style={styles.footerText}>
            Built with care for church communities everywhere.
          </AppText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    textAlign: 'center',
  },
  mainHeading: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    marginBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.isDark ? theme.colors.border : 'rgba(210, 180, 140, 0.3)',
    ...theme.shadows.soft,
  },
  cardTitle: {
    marginBottom: theme.spacing.md,
  },
  cardContent: {
    lineHeight: 24,
  },
  footer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.primary,
    opacity: 0.65,
    textAlign: 'center',
  }
});
