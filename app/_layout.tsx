import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type SubscriptionPurchase,
  type PurchaseError,
} from 'react-native-iap';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import useDeepLinkListener from '../hooks/useDeepLinkListener';

const IAP_SKUS = ['leader.subscription', 'founder.subscription'];

function RootLayoutContent() {
  useDeepLinkListener();
  const { updateUserPlanFromIAP, refreshUserProfile } = useAuthContext() as {
    updateUserPlanFromIAP: (plan: string) => Promise<void>;
    refreshUserProfile: () => Promise<void>;
  };

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
            console.log('🍎 PURCHASE UPDATE:', purchase.productId);
            console.log('🍎 Transaction ID:', purchase.transactionId);
            console.log('🍎 Transaction Receipt:', purchase.transactionReceipt ? 'YES' : 'NO');

            if (purchase.transactionReceipt) {
              try {
                // Determine plan from product ID
                const plan = purchase.productId.includes('leader') ? 'leader' : 'founder';
                console.log('🍎 PURCHASE SUCCESS - Plan:', plan);

                // Update user plan in Supabase
                await updateUserPlanFromIAP(plan);
                console.log('🍎 USER PLAN UPDATED IN SUPABASE');

                // Finish the transaction (required by Apple)
                await finishTransaction({ purchase, isConsumable: false });
                console.log('🍎 TRANSACTION FINISHED');

                // Refresh user profile to update UI
                await refreshUserProfile();
                console.log('🍎 USER PROFILE REFRESHED');

                Alert.alert('Success!', 'Your subscription is now active.');
              } catch (err) {
                console.log('🍎 Error processing purchase:', err);
              }
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

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
