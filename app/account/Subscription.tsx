import { useAuthContext } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useColorScheme } from '../../hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, userProfile, logout, restorePurchases } = useAuthContext() as unknown as {
    user: { id?: string; email?: string } | null;
    userProfile: { plan?: string; stripe_customer_id?: string } | null;
    logout: () => Promise<void>;
    restorePurchases: () => Promise<void>;
  };
  
  const userEmail = user?.email || 'Not signed in';
  const userPlan = userProfile?.plan || 'free';
  const displayPlan = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);
  const hasStripeSubscription = !!userProfile?.stripe_customer_id;
  const hasPaidPlan = userPlan === 'leader' || userPlan === 'founder';
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Open iOS subscription management settings
  const handleManageIOSSubscription = () => {
    // Deep link to iOS subscription settings
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  // Handle restore purchases
  const handleRestorePurchases = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      await restorePurchases();
    } catch (err) {
      console.log('Restore error:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to delete your account.');
      return;
    }

    Alert.alert(
      'Are you sure you want to delete your account?',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log('🔴 Deleting account for user:', user.id);
              
              const response = await fetch(
                'https://chema-00yh.onrender.com/delete-account',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ user_id: user.id }),
                }
              );

              const data = await response.json();
              console.log('🔴 Delete response:', response.status, data);

              if (!response.ok) {
                throw new Error(data.error || 'Failed to delete account');
              }

              Alert.alert('Your account has been deleted.', '', [
                {
                  text: 'OK',
                  onPress: async () => {
                    await logout();
                    router.replace('/auth/Register');
                  },
                },
              ]);
            } catch (err: any) {
              console.error('🔴 Delete account error:', err);
              Alert.alert('Error', err.message || 'Failed to delete account. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  
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
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={[styles.backText, { color: '#888888' }]}>back</Text>
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

        {/* Stripe subscription management (Android/Web) */}
        {hasStripeSubscription && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isDark ? '#0D0D0D' : '#F1F1F1',
                borderWidth: 1,
                borderColor: isDark ? '#555555' : '#000000',
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

        {/* iOS subscription management - Apple requirement */}
        {Platform.OS === 'ios' && hasPaidPlan && !hasStripeSubscription && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isDark ? '#0D0D0D' : '#F1F1F1',
                borderWidth: 1,
                borderColor: isDark ? '#555555' : '#000000',
                height: 48,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
            onPress={handleManageIOSSubscription}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Manage Subscription
            </Text>
          </TouchableOpacity>
        )}

        {/* Restore Purchases - Apple requirement */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: 'transparent',
                borderWidth: 0,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 8,
              },
            ]}
            onPress={handleRestorePurchases}
            activeOpacity={0.7}
            disabled={isRestoring}
          >
            <Text style={[styles.restoreText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
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

        {/* Delete Account - Apple Guideline 5.1.1(v) compliance */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          activeOpacity={0.6}
        >
          <Text style={styles.deleteAccountText}>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
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
  deleteAccountButton: {
    marginTop: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#DC3545',
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
});
