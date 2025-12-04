import { useAuthContext } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../lib/supabase';
import { getOrCreateUserId } from '../../utils/identity';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, userProfile, logout } = useAuthContext() as unknown as {
    user: { id?: string; email?: string } | null;
    userProfile: any;
    logout: () => Promise<void>;
  };
  
  const handleLogoutPress = async () => {
    try {
      await logout();
      router.back(); // go back after logout
    } catch (err) {
      console.error('Logout press error:', err);
    }
  };
  
  const userEmail = user?.email || 'Anonymous';
  
  const handleManageSubscription = async () => {
    console.log('🔵 Manage Subscription button clicked');
    console.log('🔵 User:', user?.id, user?.email);
    
    if (!user?.id) {
      alert('Please sign in to manage your subscription.');
      return;
    }
    
    try {
      const deviceId = await getOrCreateUserId();
      let stripeCustomerId = null;
      
      console.log('🔵 Getting Stripe customer ID from public.users...');
      console.log('🔵 Device ID:', deviceId);
      console.log('🔵 Supabase user ID:', user?.id);
      
      // Query public.users - get ALL records and find the one WITH stripe_customer_id
      // Don't use .single() because there might be multiple rows (old one with stripe, new "free" one)
      if (user?.id) {
        console.log('🔵 Querying by supabase_user_id...');
        const { data: records, error } = await supabase
          .from('users')
          .select('id, device_id, supabase_user_id, plan, stripe_customer_id')
          .eq('supabase_user_id', user.id);
        
        console.log('🟢 Query result:', JSON.stringify({ records, error }, null, 2));
        
        if (records && records.length > 0) {
          // Find the record that HAS a stripe_customer_id (not null)
          const recordWithStripe = records.find((r: any) => r.stripe_customer_id);
          if (recordWithStripe?.stripe_customer_id) {
            stripeCustomerId = recordWithStripe.stripe_customer_id;
            console.log('✅ Found Stripe customer ID:', stripeCustomerId);
          } else {
            console.log('⚠️ No record with Stripe customer ID found');
            console.log('⚠️ All records:', records);
          }
        }
      }
      
      // Also try device_id if supabase_user_id didn't work
      if (!stripeCustomerId) {
        console.log('🔵 Querying by device_id...');
        const { data: records, error } = await supabase
          .from('users')
          .select('id, device_id, supabase_user_id, plan, stripe_customer_id')
          .eq('device_id', deviceId);
        
        console.log('🟢 Device query result:', JSON.stringify({ records, error }, null, 2));
        
        if (records && records.length > 0) {
          const recordWithStripe = records.find((r: any) => r.stripe_customer_id);
          if (recordWithStripe?.stripe_customer_id) {
            stripeCustomerId = recordWithStripe.stripe_customer_id;
            console.log('✅ Found Stripe customer ID by device_id:', stripeCustomerId);
          }
        }
      }
      
      if (!stripeCustomerId) {
        console.log('🔴 Could not find Stripe customer ID in public.users');
        alert('Could not find your subscription. Please contact support.');
        return;
      }
      
      // Now send the Stripe customer ID to backend
      console.log('🔵 Sending Stripe customer ID to backend:', stripeCustomerId);
      
      let response = await fetch(
        'https://chema-00yh.onrender.com/stripe/create-portal-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userProfile?.id || deviceId,
          },
          body: JSON.stringify({
            user_id: userProfile?.id || deviceId,
            stripe_customer_id: stripeCustomerId, // Send the Stripe customer ID we found
          }),
        }
      );
      
      let data = await response.json();
      console.log('🟢 Portal response:', JSON.stringify(data, null, 2));
      console.log('🟢 Response status:', response.status);
      
      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || data.error || 'Failed to create portal session';
        console.error('🔴 Portal error details:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.message,
          fullResponse: data
        });
        
        // User-friendly error message
        if (errorMsg.includes('0 rows') || errorMsg.includes('PGRST116')) {
          alert(
            'No subscription found.\n\n' +
            'This might happen if:\n' +
            '• Your device ID changed\n' +
            '• You subscribed with a different account\n\n' +
            'Please contact support to link your subscription.'
          );
        } else {
          alert(`Error: ${errorMsg}`);
        }
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
      console.error('🔴 Error stack:', err.stack);
      console.error('🔴 Full error:', JSON.stringify(err, null, 2));
      alert(`Error: ${err.message || 'Failed to connect to server'}\n\nCheck console for details.`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }}>
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

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: '#F1F1F1',
              borderWidth: 1,
              borderColor: '#D9D9D9',
              height: 48,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onPress={handleManageSubscription}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
            Manage Subscription
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: '#F1F1F1',
              borderWidth: 1,
              borderColor: '#D9D9D9',
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
              router.replace('/'); // navigate to home
            } catch (error) {
              console.error('🔴 Logout failed:', error);
              // Still navigate even if logout had issues
              router.replace('/');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
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

