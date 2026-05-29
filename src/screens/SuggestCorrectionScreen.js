import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { AppButton } from '../components/AppButton';
import { theme } from '../utils/theme';
import { submitCorrection } from '../services/churchService';

export const SuggestCorrectionScreen = ({ route, navigation }) => {
  const { church } = route.params;
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      Alert.alert("Error", "Please enter your suggested correction.");
      return;
    }

    setIsSubmitting(true);
    const success = await submitCorrection(church.id, {
      churchName: church.name,
      suggestion: suggestion.trim()
    });
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        "Thank You", 
        "Your suggestion has been submitted and will be reviewed.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert("Notice", "Failed to submit correction at this time. We will try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AppText variant="headingMedium" color="primary" style={styles.title}>
            Suggest a Correction
          </AppText>
          <AppText variant="body" color="textLight" style={styles.subtitle}>
            Notice an incorrect mass timing or missing detail for {church.name}? Let us know below.
          </AppText>

          <AppTextInput
            placeholder="E.g., Sunday morning mass is now at 8:00 AM..."
            value={suggestion}
            onChangeText={setSuggestion}
            multiline
            numberOfLines={6}
            style={styles.inputArea}
          />

          <AppButton 
            title={isSubmitting ? "Submitting..." : "Submit Suggestion"} 
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  inputArea: {
    height: 150,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  }
});
