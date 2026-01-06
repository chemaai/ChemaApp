import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function MonthlyAuditScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={[styles.backText, { color: '#888888' }]}>back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Monthly Audit</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#666' : '#999' }]}>Coming soon</Text>
          
          <View style={styles.textContainer}>
            <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              What it is
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              A monthly review of your decisions, outcomes, goals, and initiatives — designed to surface patterns, gaps, and blind spots over time.
            </Text>

            <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Why it exists
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              Most failures don't come from bad decisions.{'\n'}They come from lack of follow-through.
            </Text>

            <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              What it will do
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              • Review decisions made during the month{'\n'}
              • Connect decisions to outcomes{'\n'}
              • Highlight unresolved items{'\n'}
              • Surface recurring patterns across time{'\n'}
              • Create accountability without manual tracking
            </Text>

            <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Status
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              Monthly Audit is currently in development and will be released soon.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 1001,
  },
  backText: {
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
  },
  textContainer: {
    width: '90%',
    maxWidth: 500,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16.5,
    lineHeight: 25,
    textAlign: 'left',
    marginBottom: 22,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 60,
  },
});

