import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn } from 'react-native-reanimated';
import { useAuthContext } from '../context/AuthContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import AboutScreen from './about';
import ContactScreen from './contact';
import MissionScreen from './mission';
import TheFounderScreen from './the-founder';
import UpgradeModal from './components/UpgradeModal';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthContext() as { user: { id?: string; email?: string } | null };
  const [activeScreen, setActiveScreen] = useState<'about' | 'mission' | 'founder' | 'contact' | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleOpenScreen = (screen: 'about' | 'mission' | 'founder' | 'contact') => {
    setActiveScreen(screen);
  };

  const handleCloseScreen = () => {
    setActiveScreen(null);
  };

  const handleBack = () => {
    router.back();
  };

  const isLoggedIn = !!user?.email;

  const baseMenuItems = [
    'About',
    'Mission',
    'Contact Us',
    'Upgrade Plan',
  ];

  const authMenuItem = isLoggedIn ? 'My Account' : 'Sign Up / Log In';
  const menuItems = [...baseMenuItems, authMenuItem];

  return (
    <AnimatedReanimated.View
      entering={FadeIn.duration(250)}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }
      ]}
    >
      {activeScreen ? (
        <>
          {activeScreen === 'about' && <AboutScreen onClose={handleCloseScreen} />}
          {activeScreen === 'mission' && <MissionScreen onClose={handleCloseScreen} />}
          {activeScreen === 'founder' && <TheFounderScreen onClose={handleCloseScreen} />}
          {activeScreen === 'contact' && <ContactScreen onClose={handleCloseScreen} />}
        </>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.backText, { color: isDark ? '#888888' : '#888888' }]}>back</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={isDark 
                ? require('../assets/images/flower_dark.svg')
                : require('../assets/images/flower.svg')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          <View style={styles.menuItemsContainer}>
            {menuItems.map((item, index) => {
              const handlePress = async () => {
                if (item === 'About') {
                  handleOpenScreen('about');
                } else if (item === 'Mission') {
                  handleOpenScreen('mission');
                } else if (item === 'The Founder') {
                  handleOpenScreen('founder');
                } else if (item === 'Contact Us') {
                  handleOpenScreen('contact');
                } else if (item === 'Upgrade Plan') {
                  setShowUpgradeModal(true);
                } else if (item === 'Sign Up / Log In') {
                  router.push('/auth/Login');
                } else if (item === 'My Account') {
                  router.push('/MyAccount');
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={handlePress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.menuItemText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </AnimatedReanimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    width: 99,
    height: 99,
  },
  menuItemsContainer: {
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 4,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '500',
  },
});

