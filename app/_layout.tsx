import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Alert, Platform, View } from 'react-native';
import {
    endConnection,
    finishTransaction,
    getSubscriptions,
    initConnection,
    purchaseErrorListener,
    purchaseUpdatedListener,
    type PurchaseError,
    type SubscriptionPurchase,
} from 'react-native-iap';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import useDeepLinkListener from '../hooks/useDeepLinkListener';

// Prevent splash screen from auto-hiding until auth check completes
SplashScreen.preventAutoHideAsync();

// IAP Product IDs - must match App Store Connect exactly
const IAP_SKUS = ['leader.subscription', 'founder.subscription'];

// Backend API URL
const API_BASE_URL = 'https://chema-00yh.onrender.com';

// Environment detection for sandbox vs production
const getEnvironment = () => __DEV__ ? 'sandbox' : 'production';

function RootLayoutContent() {
  useDeepLinkListener();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const hasNavigated = useRef(false);
  const { user, loadingAuth, refreshUserProfile } = useAuthContext() as {
    user: { id: string } | null;
    loadingAuth: boolean;
    refreshUserProfile: () => Promise<void>;
  };

  // Auto-navigate authenticated users to /chat on app startup only (not during normal navigation)
  useEffect(() => {
    async function handleAuthNavigation() {
      if (!loadingAuth && !hasNavigated.current) {
        hasNavigated.current = true;
        
        if (user?.id) {
          const currentRoute = segments.join('/');
          if (!currentRoute || currentRoute === '' || currentRoute === 'index') {
            router.replace('/dashboard');
          }
        }
        
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 100);
      }
    }
    
    handleAuthNavigation();
  }, [loadingAuth, user, segments]);

  useEffect(() => {
    let purchaseUpdateSubscription: any = null;
    let purchaseErrorSubscription: any = null;

    const initializeIAP = async () => {
      if (Platform.OS !== 'ios') {
        console.log('🍎 IAP: Skipping init (not iOS)');
        return;
      }

      try {
        // Initialize connection to App Store
        const result = await initConnection();
        console.log('🍎 IAP INIT OK:', result);

        // Load available products
        const subscriptions = await getSubscriptions({ skus: IAP_SKUS });
        console.log('🍎 PRODUCTS LOADED:', subscriptions.length, 'subscriptions');
        subscriptions.forEach((sub) => {
          console.log('🍎 Product:', sub.productId, '-', sub.localizedPrice);
        });

        // Listen for successful purchases
        purchaseUpdateSubscription = purchaseUpdatedListener(
          async (purchase: SubscriptionPurchase) => {
            const environment = getEnvironment();
            console.log('🍎 ═══════════════════════════════════════');
            console.log('🍎 PURCHASE UPDATE RECEIVED');
            console.log('🍎 Product ID:', purchase.productId);
            console.log('🍎 Transaction ID:', purchase.transactionId);
            console.log('🍎 Environment:', environment);
            console.log('🍎 Has Receipt:', purchase.transactionReceipt ? 'YES' : 'NO');
            console.log('🍎 ═══════════════════════════════════════');

            if (purchase.transactionReceipt) {
              try {
                // Get current user ID for backend verification
                const userId = user?.id;
                if (!userId) {
                  console.log('🍎 ERROR: No user logged in, cannot verify receipt');
                  Alert.alert('Error', 'Please log in to complete your purchase.');
                  return;
                }

                console.log('🍎 Sending receipt to backend for verification...');
                console.log('🍎 User ID:', userId.slice(0, 8) + '...');
                console.log('🍎 Endpoint:', `${API_BASE_URL}/api/verify-iap-receipt`);

                // Send receipt to backend for Apple verification
                const verifyResponse = await fetch(`${API_BASE_URL}/api/verify-iap-receipt`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId,
                  },
                  body: JSON.stringify({
                    receiptData: purchase.transactionReceipt,
                    productId: purchase.productId,
                    transactionId: purchase.transactionId,
                    environment: environment,
                  }),
                });

                console.log('🍎 Backend response status:', verifyResponse.status);

                if (!verifyResponse.ok) {
                  const errorData = await verifyResponse.json().catch(() => ({}));
                  console.log('🍎 Backend verification FAILED:', errorData);
                  Alert.alert(
                    'Verification Failed',
                    'Could not verify your purchase. Please contact support if this persists.',
                    [{ text: 'OK' }]
                  );
                  return;
                }

                const verifyData = await verifyResponse.json();
                console.log('🍎 Backend verification SUCCESS:', verifyData);

                // Only finish transaction AFTER backend confirms receipt is valid
                await finishTransaction({ purchase, isConsumable: false });
                console.log('🍎 TRANSACTION FINISHED with Apple');

                // Refresh user profile to get updated plan from backend
                await refreshUserProfile();
                console.log('🍎 USER PROFILE REFRESHED');

                Alert.alert('Success!', 'Your subscription is now active.');
                console.log('🍎 ═══════════════════════════════════════');
                console.log('🍎 PURCHASE FLOW COMPLETE');
                console.log('🍎 ═══════════════════════════════════════');
              } catch (err: any) {
                console.log('🍎 ERROR processing purchase:', err?.message || err);
                Alert.alert(
                  'Purchase Error',
                  'Something went wrong processing your purchase. Please try again or contact support.',
                  [{ text: 'OK' }]
                );
              }
            } else {
              console.log('🍎 WARNING: No transaction receipt in purchase object');
            }
          }
        );

        // Listen for purchase errors
        purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
          console.log('🍎 PURCHASE ERROR:', error.code, error.message);
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
          }
        });

        console.log('🍎 IAP LISTENERS ATTACHED');
      } catch (err) {
        console.log('🍎 IAP INIT ERROR:', err);
      }
    };

    initializeIAP();

    // Cleanup on unmount
    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      if (Platform.OS === 'ios') {
        endConnection();
        console.log('🍎 IAP CONNECTION ENDED');
      }
    };
  }, []);

  // Don't render app content while checking auth - keep splash visible
  if (loadingAuth) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="chat"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen 
        name="decisions"
        options={{ gestureEnabled: true }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <RootLayoutContent />
      </ChatProvider>
    </AuthProvider>
  );
}
