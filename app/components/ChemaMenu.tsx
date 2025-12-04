import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuthContext } from '../../context/AuthContext';
import AboutScreen from '../about';
import ContactScreen from '../contact';
import MissionScreen from '../mission';
import TheFounderScreen from '../the-founder';

interface ChemaMenuProps {
  onClose: () => void;
}

export default function ChemaMenu({ onClose }: ChemaMenuProps) {
  const { user, session } = useAuthContext() as { user: { id?: string; email?: string } | null; session: any; loading: boolean };
  const [activeScreen, setActiveScreen] = useState<'about' | 'mission' | 'founder' | 'contact' | null>(null);

  const handleOpenScreen = (screen: 'about' | 'mission' | 'founder' | 'contact') => {
    setActiveScreen(screen);
  };

  const handleCloseScreen = () => {
    setActiveScreen(null);
  };

  const isLoggedIn = !!user?.email;

  const baseMenuItems = [
    'About',
    'Mission',
    'The Founder',
    'Contact Us',
  ];

  const authMenuItem = isLoggedIn ? 'My Account' : 'Sign Up / Log In';
  const menuItems = [...baseMenuItems, authMenuItem];

  return (
    <AnimatedReanimated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      style={[
        styles.overlay,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        },
      ]}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
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
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/flower.svg')}
              style={styles.logo}
              resizeMode="contain"
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
                } else if (item === 'Sign Up / Log In') {
                  router.push('/auth/Login');
                  onClose();
                  return;
                } else if (item === 'My Account') {
                  router.push('/MyAccount');
                  onClose();
                  return;
                } else {
                  onClose();
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={handlePress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </AnimatedReanimated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: 'rgba(0,0,0,0.85)',
    fontWeight: '500',
  },
});

