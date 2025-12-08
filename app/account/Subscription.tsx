import { useAuthContext } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useColorScheme } from '../../hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, userProfile, logout } = useAuthContext() as unknown as {
    user: { id?: string; email?: string } | null;
    userProfile: { plan?: string; stripe_customer_id?: string } | null;
    logout: () => Promise<void>;
  };
  
  const userEmail = user?.email || 'Not signed in';
  const userPlan = userProfile?.plan || 'free';
  const displayPlan = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);
  const hasStripeSubscription = !!userProfile?.stripe_customer_id;
  
  const handleManageSubscription = async () => {
    console.log('🔵 Manage Subscription button clicked');
    console.log('🔵 User:', user?.id, user?.email);
    
    if (!user?.id) {
      alert('Please sign in to manage your subscription.');
      return;
    }
    
    if (!userProfile?.stripe_customer_id) {
      alert('No active subscription found.');
      return;
    }
    
    try {
      console.log('🔵 Sending portal request for user:', user.id);
      
      const response = await fetch(
        'https://chema-00yh.onrender.com/stripe/create-portal-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': user.id,
          },
          body: JSON.stringify({}),
        }
      );
      
      const data = await response.json();
      console.log('🟢 Portal response:', JSON.stringify(data, null, 2));
      console.log('🟢 Response status:', response.status);
      
      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || data.error || 'Failed to create portal session';
        console.error('🔴 Portal error:', errorMsg);
        alert(`Error: ${errorMsg}`);
        return;
      }
      
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        const errorMsg = data.error || data.message || 'No portal URL returned';
        console.error('🔴 Missing portal URL:', data);
        alert(`Error: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error('🔴 Portal session error:', err);
      alert(`Error: ${err.message || 'Failed to connect to server'}`);
    }
  };

  return (
    <AnimatedReanimated.View
      entering={FadeInUp.duration(350)}
      exiting={FadeOutUp.duration(250)}
      style={{ flex: 1, backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="close" 
          size={28} 
          color={isDark ? '#FFFFFF' : '#000000'} 
        />
      </TouchableOpacity>
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
          My Account
        </Text>

        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)' }]}>
            Email
          </Text>
          <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {userEmail}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)' }]}>
            Plan
          </Text>
          <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {displayPlan}
          </Text>
        </View>

        {hasStripeSubscription && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isDark ? '#0D0D0D' : '#F1F1F1',
                borderWidth: 1,
                borderColor: isDark ? '#555555' : '#D9D9D9',
                height: 48,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
            onPress={handleManageSubscription}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Manage Subscription
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: '#1A1A1A',
              borderWidth: 0,
              borderColor: 'transparent',
              height: 48,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 16,
            },
          ]}
          onPress={async () => {
            console.log('🔵 Logout button pressed');

            try {
              await logout();
              console.log('🟢 Logout completed successfully');
              router.replace('/');
            } catch (error) {
              console.error('🔴 Logout failed:', error);
              router.replace('/');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </AnimatedReanimated.View>
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
    marginBottom: 32,
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
