import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, Linking, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as RNIap from 'react-native-iap';
import AnimatedReanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuthContext } from '../../context/AuthContext';

interface UpgradeModalProps {
  checkoutUrl?: string;
  onClose: () => void;
}

export default function UpgradeModal({ checkoutUrl, onClose }: UpgradeModalProps) {
  const { user, userProfile, restorePurchases } = useAuthContext() as unknown as { 
    user: { id?: string } | null; 
    userProfile: { plan?: string } | null;
    restorePurchases: () => Promise<void>;
  };
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Handle restore purchases
  const handleRestorePurchases = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      await restorePurchases();
      onClose(); // Close modal after restore attempt
    } catch (err) {
      console.log("🍎 Restore error in modal:", err);
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Determine current plan and suggested upgrade
  const currentPlan = userProfile?.plan || 'free';
  const suggestedPlan: 'leader' | 'founder' = currentPlan === 'leader' ? 'founder' : 'leader';

  // Stripe checkout for Android/Web (kept for non-iOS platforms)
  const openStripeCheckout = async (plan: "leader" | "founder") => {
    if (!user?.id) {
      console.error("Cannot checkout without logged-in user");
      return;
    }
    
    try {
      console.log("🛒 Starting Stripe checkout with user ID:", user.id.slice(0, 8) + "...");
      
      const response = await fetch(
        "https://chema-00yh.onrender.com/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": user.id,
          },
          body: JSON.stringify({
            plan_name: plan,
            success_url: "chemaapp://payment-success",
            cancel_url: "chemaapp://payment-cancel",
          })
        }
      );

      const data = await response.json();
      console.log("🛒 Checkout response:", data);

      if (data.url) {
        Linking.openURL(data.url);
      } else {
        console.error("Missing checkout URL:", data);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // IAP purchase for iOS
  const buySubscription = async (plan: "leader" | "founder") => {
    const sku = plan === "leader" ? "leader.subscription" : "founder.subscription";
    
    if (isPurchasing) {
      console.log("🍎 Purchase already in progress");
      return;
    }

    setIsPurchasing(true);

    try {
      if (Platform.OS === "ios") {
        console.log("🍎 PURCHASE STARTED:", sku);
        
        // Check if requestSubscription is available (only in native builds, not Expo Go)
        if (typeof RNIap.requestSubscription !== 'function') {
          console.log("🍎 IAP not available - using Stripe fallback");
          Alert.alert(
            "App Store Required",
            "In-app purchases are only available in the App Store version. Please download from the App Store to subscribe.",
            [{ text: "OK" }]
          );
          setIsPurchasing(false);
          return;
        }
        
        // Request the subscription - listeners in _layout.tsx will handle the result
        await RNIap.requestSubscription({ sku });
        console.log("🍎 PURCHASE REQUEST SENT:", sku);
        
        // Note: Don't close modal here - wait for purchase listener to confirm success
        // The purchaseUpdatedListener in _layout.tsx handles success
      } else {
        // Android/Web: Use Stripe
        console.log("🛒 Non-iOS platform, using Stripe");
        openStripeCheckout(plan);
      }
    } catch (err: any) {
      console.log("🍎 IAP PURCHASE ERROR:", err?.code, err?.message);
      
      // Don't fall back to Stripe on iOS - show user-friendly message instead
      if (Platform.OS === "ios") {
        if (err?.code === 'E_USER_CANCELLED') {
          console.log("🍎 User cancelled purchase");
          // Don't show alert for user cancellation
        } else {
          Alert.alert(
            "Purchase Failed",
            "Unable to complete purchase. Please try again or check your App Store settings.",
            [{ text: "OK" }]
          );
        }
      } else {
        // Non-iOS: Fall back to Stripe
        openStripeCheckout(plan);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <AnimatedReanimated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <AnimatedReanimated.View
          entering={FadeIn.duration(300).delay(50)}
          style={styles.modalContainer}
        >
          <BlurView intensity={20} style={styles.blurContainer}>
            <Image
              source={require('../../assets/images/flower_dark.svg')}
              style={styles.flowerWatermark}
              contentFit="contain"
            />
            <View style={styles.contentContainer}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 22, bottom: 22, left: 22, right: 22 }}
              >
                <Ionicons name="close" size={20} color="rgba(0,0,0,0.65)" />
              </TouchableOpacity>

              <Image
                source={require('../../assets/images/flower.svg')}
                style={styles.logo}
                contentFit="contain"
              />

              <Text style={styles.title}>Upgrade to Continue</Text>
              <Text style={styles.subtitle}>
                {currentPlan === 'free' 
                  ? "You've reached today's limit. Upgrade to continue."
                  : "You've reached your Leader plan limit. Upgrade to Founder for unlimited access."}
              </Text>

              <View style={styles.tierContainer}>
                {/* LEADER TIER */}
                <View style={styles.tier}>
                  <Text style={styles.tierName}>
                    LEADER
                  </Text>
                  <Text style={styles.tierPrice}>
                    $9.99/month
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Daily executive conversations
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Unlimited executive memory
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Track decisions, outcomes & milestones
                  </Text>
                </View>

                {/* FOUNDER TIER - PREMIUM */}
                <View style={[styles.tier, styles.founderTier]}>
                  <Text style={styles.tierName}>
                    FOUNDER
                  </Text>
                  <Text style={styles.tierPrice}>
                    $19.99/month
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Everything in Pro
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Extended conversation capacity
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Weekly Review (AI-powered accountability)
                  </Text>
                  <Text style={styles.tierFeature}>
                    • Pattern detection across your memory
                  </Text>
                  <Text style={styles.tierComingSoon}>
                    Coming soon: Monthly Audit & Boardroom
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                {/* Show suggested plan first (highlighted) */}
                <TouchableOpacity
                  style={[styles.planButton, styles.suggestedPlanButton]}
                  onPress={() => buySubscription(suggestedPlan)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.planName, styles.suggestedPlanName]}>
                    {suggestedPlan === 'leader' ? 'Leader' : 'Founder'}
                  </Text>
                  <Text style={[styles.planPrice, styles.suggestedPlanPrice]}>
                    {suggestedPlan === 'leader' ? '$9.99/month' : '$19.99/month'}
                  </Text>
                  <Text style={[styles.subscribeHint, styles.suggestedSubscribeHint]}>
                    {Platform.OS === "ios" ? "Subscribe now" : "Subscribe securely"}
                  </Text>
                </TouchableOpacity>

                {/* Show Founder option for free users as secondary */}
                {currentPlan === 'free' && (
                  <TouchableOpacity
                    style={styles.planButton}
                    onPress={() => buySubscription("founder")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.planName}>Founder</Text>
                    <Text style={styles.planPrice}>$19.99/month</Text>
                    <Text style={styles.subscribeHint}>{Platform.OS === "ios" ? "Subscribe now" : "Subscribe securely"}</Text>
                  </TouchableOpacity>
                )}

                {/* Restore Purchases - Apple requirement */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={handleRestorePurchases}
                    activeOpacity={0.7}
                    disabled={isRestoring}
                  >
                    <Text style={styles.restoreText}>
                      {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </BlurView>
        </AnimatedReanimated.View>
      </AnimatedReanimated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  blurContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  flowerWatermark: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    opacity: 0.07,
    zIndex: 0,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.90)',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  tierContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tier: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  founderTier: {
    borderColor: '#1C1C1E',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 10,
  },
  tierFeature: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.55)',
    marginBottom: 4,
    lineHeight: 15,
  },
  tierComingSoon: {
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.35)',
    fontStyle: 'italic',
    marginTop: 6,
  },
  buttonContainer: {
    gap: 12,
  },
  planButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedPlanButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  suggestedPlanName: {
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  suggestedPlanPrice: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  subscribeHint: {
    fontSize: 11,
    color: 'rgba(28, 28, 30, 0.6)',
    marginTop: 4,
  },
  suggestedSubscribeHint: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  restoreButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

