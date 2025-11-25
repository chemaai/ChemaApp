import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AboutScreen from '../about';
import ContactScreen from '../contact';
import MissionScreen from '../mission';
import TheFounderScreen from '../the-founder';

interface ChemaMenuProps {
  onClose: () => void;
}

export default function ChemaMenu({ onClose }: ChemaMenuProps) {
  const [activeScreen, setActiveScreen] = useState<'about' | 'mission' | 'founder' | 'contact' | null>(null);

  const handleOpenScreen = (screen: 'about' | 'mission' | 'founder' | 'contact') => {
    setActiveScreen(screen);
  };

  const handleCloseScreen = () => {
    setActiveScreen(null);
  };

  const menuItems = [
    'About',
    'Mission',
    'The Founder',
    'Contact Us',
    'Sign Up / Log In',
    'Log Out',
  ];

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
              const handlePress = () => {
                if (item === 'About') {
                  handleOpenScreen('about');
                } else if (item === 'Mission') {
                  handleOpenScreen('mission');
                } else if (item === 'The Founder') {
                  handleOpenScreen('founder');
                } else if (item === 'Contact Us') {
                  handleOpenScreen('contact');
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

