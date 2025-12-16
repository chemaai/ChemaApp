import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';

const prompts = [
  "Clarify what matters today",
  "Help me lead my team",
  "Think through a decision",
  "What should I focus on",
  "Help me slow down and think",
  "Prepare me for a conversation",
  "Summarize what I need to know",
];

interface ExamplePromptsProps {
  onSend: (text: string) => void;
  visible: boolean;
  paused?: boolean;
}

// Individual bubble with pulsing first word
function PromptBubble({
  prompt,
  onSend,
  paused,
  bubbleBackground,
  bubbleBorder,
  boldColor,
  textColor,
}: {
  prompt: string;
  onSend: (text: string) => void;
  paused: boolean;
  bubbleBackground: string;
  bubbleBorder: string;
  boldColor: string;
  textColor: string;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (paused) {
      pulseAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(3560), // Total cycle ~4 seconds
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [paused, pulseAnim]);

  const firstSpaceIndex = prompt.indexOf(' ');
  const firstWord = firstSpaceIndex === -1 ? prompt : prompt.slice(0, firstSpaceIndex);
  const rest = firstSpaceIndex === -1 ? '' : prompt.slice(firstSpaceIndex);

  return (
    <TouchableOpacity
      onPress={() => onSend(prompt)}
      activeOpacity={0.6}
      style={[
        styles.bubble,
        {
          backgroundColor: bubbleBackground,
          borderColor: bubbleBorder,
        },
      ]}
    >
      <Text style={styles.bubbleText}>
        <Animated.Text style={[styles.boldText, { color: boldColor, opacity: pulseAnim }]}>
          {firstWord}
        </Animated.Text>
        {rest && <Text style={[styles.normalText, { color: textColor }]}>{rest}</Text>}
      </Text>
    </TouchableOpacity>
  );
}

export default function ExamplePrompts({ onSend, visible, paused = false }: ExamplePromptsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  // Match chat bubble colors exactly
  const bubbleBackground = isDark ? '#0D0D0D' : '#FFFFFF';
  const bubbleBorder = isDark ? '#3A3A3A' : '#D9D9D9';
  // First word: darker/more prominent
  const boldColor = isDark ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.75)';
  // Rest: slightly softer but readable
  const textColor = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.50)';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="normal"
      >
        {prompts.map((prompt, index) => (
          <PromptBubble
            key={index}
            prompt={prompt}
            onSend={onSend}
            paused={paused}
            bubbleBackground={bubbleBackground}
            bubbleBorder={bubbleBorder}
            boldColor={boldColor}
            textColor={textColor}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 13,
  },
  boldText: {
    fontSize: 13,
    fontWeight: '500',
  },
  normalText: {
    fontSize: 13,
    fontWeight: '400',
  },
});
