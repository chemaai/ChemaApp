import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { getOrCreateUserId } from '../../utils/identity';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthContext() as { user: { id?: string; email?: string } | null; session: any; loading: boolean };
  
  const isAnonymous = !user?.email;
  
  const handleUpgrade = () => {
    // TODO: Integrate upgrade modal trigger
    // setShowUpgradeModal(true);
  };
  
  const handleOpenCustomerPortal = async () => {
    try {
      const userId = await getOrCreateUserId();
      const response = await fetch(
        'https://chema-00yh.onrender.com/stripe/create-portal-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId || 'anonymous',
          },
          body: JSON.stringify({
            user_id: userId || 'anonymous',
          }),
        }
      );
      const data = await response.json();
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        console.error('Missing portal URL:', data);
      }
    } catch (err) {
      console.error('Portal session error:', err);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Image
          source={colorScheme === 'dark' 
            ? require('../../assets/images/chema_logo_dark.svg') 
            : require('../../assets/images/chema_logo.svg')} 
          style={{
            width: 200,
            height: undefined,
            aspectRatio: 1,
            marginBottom: 60,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Subscription
        </Text>

        {isAnonymous ? (
          <>
            <Text style={[styles.bodyText, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.80)' }]}>
              You are on the Free Plan. Upgrade to unlock unlimited usage.
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D9D9D9',
                },
              ]}
              onPress={handleUpgrade}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Upgrade
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.bodyText, { color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.80)' }]}>
              Manage your subscription
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D9D9D9',
                },
              ]}
              onPress={handleOpenCustomerPortal}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Open Customer Portal
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Text style={[styles.backLinkText, { color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)' }]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    marginTop: SCREEN_HEIGHT * 0.20,
    marginBottom: 48,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backLink: {
    marginTop: 32,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
  },
});

