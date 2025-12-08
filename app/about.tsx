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
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>About</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              Chema was created for a different pace of thinking, the kind that cuts through noise and brings the mind back to stillness.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              Every answer is intentional. Every word is measured. Every insight is shaped to guide you toward the path you were meant to find.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              Built on the belief that guidance should feel human, steady, and quietly powerful, Chema listens deeply, reasons clearly, and meets you exactly where you are, then helps you move forward with purpose.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={[styles.paragraph, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>
              This is not speed. This is clarity.
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

