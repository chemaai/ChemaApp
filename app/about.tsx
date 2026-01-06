import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';

type AboutScreenProps = {
  onClose: () => void;
};

export default function AboutScreen({ onClose }: AboutScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <AnimatedReanimated.View
      entering={FadeInUp.duration(350)}
      exiting={FadeOutUp.duration(250)}
      style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={[styles.backText, { color: '#888888' }]}>back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>About Chema</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Decisions Become Records
              </Text>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
                Chema captures decisions as they're made and saves them permanently. Each decision becomes a reference you can return to at any time. Nothing disappears. Nothing needs to be re-explained.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Outcomes Create Accountability
              </Text>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
                Decisions don't matter unless they lead somewhere. Chema allows you to connect outcomes directly to past decisions, so progress, failures, and tradeoffs are visible and reviewable.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Weekly Reviews Surface What's Unresolved
              </Text>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
                Every week, Chema highlights open decisions, stalled initiatives, and unfinished follow-through. This creates consistent accountability without manual tracking or status updates.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Monthly Audits Reveal Patterns
              </Text>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
                Over time, Chema analyzes your decisions, goals, and initiatives to surface patterns. What's working. What's repeating. What's being avoided. This turns experience into insight.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(480)}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                No More Excuses
              </Text>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
                Chema removes the gaps where decisions get lost. What you decide, what happens, and what you do next are all connected in one system.
              </Text>
            </AnimatedReanimated.View>
          </View>
        </View>
      </ScrollView>
    </AnimatedReanimated.View>
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

