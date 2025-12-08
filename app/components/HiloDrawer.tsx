import React from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import AnimatedReanimated, { 
  Easing,
  interpolate,
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// Cinematic easing — smooth deceleration, no bounce
const EASE_OUT_CUBIC = Easing.out(Easing.cubic);
const OPEN_DURATION = 350;
const CLOSE_DURATION = 300;

interface HiloDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function HiloDrawer({ isOpen, onClose, isDark }: HiloDrawerProps) {
  const translateX = useSharedValue(isOpen ? 0 : -DRAWER_WIDTH);
  const opacity = useSharedValue(isOpen ? 1 : 0);

  React.useEffect(() => {
    if (isOpen) {
      // Opening: slide in + fade in
      translateX.value = withTiming(0, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
      opacity.value = withTiming(1, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
    } else {
      // Closing: slide out + subtle fade
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
      opacity.value = withTiming(0.85, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0.85, 1]),
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -DRAWER_WIDTH);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -DRAWER_WIDTH * 0.3 || e.velocityX < -500) {
        // Close with cinematic ease
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
        runOnJS(onClose)();
      } else {
        // Snap back open
        translateX.value = withTiming(0, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
      }
    });

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay to close drawer when tapping chat area */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { left: DRAWER_WIDTH }]} />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <AnimatedReanimated.View
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' },
            drawerStyle,
          ]}
        >
          {/* Shadow edge */}
          <View style={[styles.shadowEdge, isDark && styles.shadowEdgeDark]} />

          {/* Header */}
          <Text style={[styles.headerText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Hilo
          </Text>

          {/* Future content area */}
          <View style={styles.contentArea} />

          {/* Center placeholder */}
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Soon, your ideas will live here
            </Text>
            <Text style={[styles.placeholderSubtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>
              Saved. Organized. Instantly retrievable.
            </Text>
          </View>

          {/* Footer hint */}
          <Text style={[styles.footerHint, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' }]}>
            Chema is evolving…
          </Text>
        </AnimatedReanimated.View>
      </GestureDetector>
    </View>
  );
}

export { DRAWER_WIDTH };

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  shadowEdge: {
    position: 'absolute',
    right: -10,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  shadowEdgeDark: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  contentArea: {
    flex: 1,
  },
  placeholderContainer: {
    position: 'absolute',
    top: '45%',
    left: 24,
    right: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerHint: {
    fontSize: 12,
    textAlign: 'center',
  },
});

