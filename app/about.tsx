import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeOut } from 'react-native-reanimated';

type AboutScreenProps = {
  onClose: () => void;
};

export default function AboutScreen({ onClose }: AboutScreenProps) {
  
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
          <Text style={styles.title}>About</Text>
          <View style={styles.textContainer}>
            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(0)}>
              <Text style={styles.paragraph}>
              Chema was created for a different pace of thinking, the kind that cuts through noise and brings the mind back to stillness.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(120)}>
              <Text style={styles.paragraph}>
              Every answer is intentional. Every word is measured. Every insight is shaped to guide you toward the path you were meant to find.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(240)}>
              <Text style={styles.paragraph}>
              Built on the belief that guidance should feel human, steady, and quietly powerful, Chema listens deeply, reasons clearly, and meets you exactly where you are, then helps you move forward with purpose.
              </Text>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View entering={FadeIn.duration(900).delay(360)}>
              <Text style={styles.paragraph}>
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

