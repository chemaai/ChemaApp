import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';

type MissionScreenProps = {
  onClose: () => void;
};

export default function MissionScreen({ onClose }: MissionScreenProps) {
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
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Mission</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Chema exists to help leaders follow through.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Modern leadership fails not from lack of intelligence, but from lost decisions, broken accountability, and fragmented execution. Important choices are made, discussed, and then forgotten.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Chema is built to prevent that failure.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                We capture decisions as they happen, connect them to outcomes, and surface what remains unresolved through structured weekly reviews and monthly audits.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(480)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                This creates a continuous system of accountability across decisions, goals, and initiatives.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(600)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Chema is not designed to replace judgment.{'\n'}It is designed to preserve it over time.
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

