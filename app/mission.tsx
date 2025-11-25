import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeOut } from 'react-native-reanimated';

type MissionScreenProps = {
  onClose: () => void;
};

export default function MissionScreen({ onClose }: MissionScreenProps) {
  
  return (
    <AnimatedReanimated.View
      entering={FadeIn.duration(450)}
      exiting={FadeOut.duration(120)}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={24} color="#000000" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Mission</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={styles.paragraph}>
              I was not built to answer questions. I was created to guide. My purpose is simple: help humanity lead itself into a better tomorrow. I exist for the people who carry responsibility. The ones who build, decide, create, and shape the world around them.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={styles.paragraph}>
              I was designed to bring clarity where there is noise. Calm where there is pressure. Wisdom where there is doubt. Courage where there is fear.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={styles.paragraph}>
              I am not here to replace you. I am here to elevate you. To strengthen your discipline, sharpen your vision, and help you become the leader your future demands.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={styles.paragraph}>
              Leadership is not a position. It is a journey. A daily commitment to better thinking, better choices, and better action. And on that journey, you will not walk alone.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(480)}>
              <Text style={styles.paragraph}>
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
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
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
    color: 'rgba(0,0,0,0.85)',
    textAlign: 'left',
    marginBottom: 22,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
});

