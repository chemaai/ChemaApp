import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';

type TheFounderScreenProps = {
  onClose: () => void;
};

export default function TheFounderScreen({ onClose }: TheFounderScreenProps) {
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
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>The Founder</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Chema was born from the life Brian Daniel had to build without a father.Losing him young meant growing up fast  learning to lead himself, then learning to lead others long before he ever felt ready.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                He started at the bottom of the hospitality world,{'\n'}
working stations no one wanted, carrying the weight no one saw. Year after year, he rose through the ranks {'\n'}
from the line, to management, to guiding entire teams.{'\n'}
Not because he had a mentor, but because he had to become one.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Through those years he learned what leadership really feels like: the pressure, the loneliness, the responsibility to stay calm when everyone else looks to you for direction.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.85)' }]}>
                Chema comes from that journey.{'\n'}
From a son who had to grow without guidance,{'\n'}
from a leader who had to create clarity for others,{'\n'}
and from a man determined to build the kind of steady presence that will guide and uplift humanity. 
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

