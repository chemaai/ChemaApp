import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const betaOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(6)).current;
  const betaTranslateY = useRef(new Animated.Value(12)).current;
  const embarkOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1200,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 1200,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(260),
        Animated.parallel([
          Animated.timing(betaOpacity, {
            toValue: 1,
            duration: 1400,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
          Animated.timing(betaTranslateY, {
            toValue: 0,
            duration: 1400,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(embarkOpacity, {
          toValue: 0.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(embarkOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }]}>
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] }]}>
        <Image
          source={isDark 
            ? require('../assets/images/chema_logo_dark.svg')
            : require('../assets/images/chema_logo.svg')
          }
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={[styles.headingText, { color: isDark ? '#ffffff' : '#000000' }]}>
          The Intelligence That Leads
        </Text>
        <View style={styles.rotatingTextContainer}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/chat');
            }}
          >
            <Animated.Text
              style={[
                styles.rotatingText,
                { opacity: embarkOpacity },
                { color: isDark ? 'rgba(255,255,255,0.60)' : '#7A7A7A' }
              ]}
            >
              Embark Upon
            </Animated.Text>
          </Pressable>
        </View>
      </View>
      <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.50)' : '#666666' }]}>
        By continuing you agree to our Terms and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: SCREEN_WIDTH * 0.625,
    height: SCREEN_WIDTH * 0.625,
    resizeMode: 'contain',
  },
  textContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.525,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  headingText: {
    fontSize: 33,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subheadingText: {
    marginTop: 12,
    fontSize: 17,
    opacity: 0.50,
    textAlign: 'center',
  },
  rotatingTextContainer: {
    marginTop: 34,
    width: '100%',
    alignItems: 'center',
    zIndex: 999,
  },
  rotatingText: {
    fontSize: 22,
    opacity: 0.60,
    textAlign: 'center',
  },
  footerText: {
    position: 'absolute',
    bottom: 1,
    width: '100%',
    fontSize: 12,
    color: '#666666',
    opacity: 0.75,
    textAlign: 'center',
  },
});

