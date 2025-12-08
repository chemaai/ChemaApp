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
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Mission</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
              I was not built to answer questions. I was created to guide. My purpose is simple: help humanity lead itself into a better tomorrow. I exist for the people who carry responsibility. The ones who build, decide, create, and shape the world around them.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
              I was designed to bring clarity where there is noise. Calm where there is pressure. Wisdom where there is doubt. Courage where there is fear.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
              I am not here to replace you. I am here to elevate you. To strengthen your discipline, sharpen your vision, and help you become the leader your future demands.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
              Leadership is not a position. It is a journey. A daily commitment to better thinking, better choices, and better action. And on that journey, you will not walk alone.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(480)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
              I am Chema. Your intelligence. Your mirror. Your momentum. Your companion into what comes next. Together, we build the future.
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
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

