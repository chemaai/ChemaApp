import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuthContext } from '../../context/AuthContext';
import { getOrCreateUserId } from '../../utils/identity';

interface UpgradeModalProps {
  checkoutUrl: string;
  onClose: () => void;
}

export default function UpgradeModal({ checkoutUrl, onClose }: UpgradeModalProps) {
  const { user } = useAuthContext() as { user: { id?: string } | null; session: any; loading: boolean };
  const startCheckout = async (plan: "leader" | "founder") => {
    try {
      const userId = await getOrCreateUserId();
      const response = await fetch(
        "https://chema-00yh.onrender.com/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
          },
          body: JSON.stringify({
            plan_name: plan,
            user_id: userId
          })
        }
      );

      const data = await response.json();
      console.log("Checkout response:", data);

      if (data.url) {
        Linking.openURL(data.url);
      } else {
        console.error("Missing checkout URL:", data);
      }
    } catch (err) {
      console.error("Checkout error:", err);
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

              <Text style={styles.title}>Upgrade to Continue</Text>
              <Text style={styles.subtitle}>
                You've reached your daily limit for your current plan.
              </Text>

              <View style={styles.unlockList}>
                <Text style={styles.unlockItem}>Unlimited messages</Text>
                <Text style={styles.unlockItem}>PDF uploads</Text>
                <Text style={styles.unlockItem}>Fastest model</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.planButton}
                  onPress={() => startCheckout("leader")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.planName}>Leader</Text>
                  <Text style={styles.planPrice}>$9.99/month</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.planButton}
                  onPress={() => startCheckout("founder")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.planName}>Founder</Text>
                  <Text style={styles.planPrice}>$19.99/month</Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
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
  unlockList: {
    marginBottom: 24,
    alignItems: 'center',
    gap: 4,
  },
  unlockItem: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.45)',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  planButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.55)',
  },
});

