import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { getAvailablePurchases } from "react-native-iap";
import { supabase } from "../lib/supabase";

// Backend API URL
const API_BASE_URL = "https://chema-00yh.onrender.com";

// Environment detection for sandbox vs production
const getEnvironment = () => __DEV__ ? "sandbox" : "production";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --------------------------------------------------
  // Fetch user profile from public.users
  // Selects: id, supabase_user_id, plan, stripe_customer_id
  // Handles multiple rows - prefers the one with stripe_customer_id
  // --------------------------------------------------
  async function refreshUserProfile(currentUser = null) {
    try {
      const activeUser = currentUser || user;
      if (!activeUser?.id) {
        setUserProfile(null);
        setLoadingProfile(false);
        return;
      }

      console.log("🔄 Refreshing user profile for:", activeUser.id.slice(0, 8) + "...");

      const { data, error } = await supabase
        .from("users")
        .select("id, plan, stripe_customer_id")
        .eq("id", activeUser.id);

      if (error) {
        console.log("Failed to refresh profile:", error);
        setLoadingProfile(false);
        return;
      }

      if (data && data.length > 0) {
        // If multiple rows exist, prefer the one with stripe_customer_id
        const recordWithStripe = data.find((r: any) => r.stripe_customer_id);
        const profileData = recordWithStripe || data[0];
        console.log("✅ Profile loaded:", profileData.plan, profileData.stripe_customer_id ? "(has Stripe)" : "(no Stripe)");
        setUserProfile(profileData);
      } else {
        console.log("⚠️ No profile found for user");
        setUserProfile(null);
      }
    } catch (err) {
      console.log("Failed to refresh profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }

  // --------------------------------------------------
  // Listen for auth state changes
  // --------------------------------------------------
  useEffect(() => {
    const loadSession = async () => {
      console.log('🔄 Loading session...');
      
      // Debug: Check what's in SecureStore
      try {
        const stored = await SecureStore.getItemAsync('sb-bzjacfpakzdquohsxsik-auth-token');
        console.log('📦 SecureStore auth token:', stored ? 'EXISTS (length: ' + stored.length + ')' : 'NULL');
      } catch (e) {
        console.log('❌ SecureStore read error:', e);
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔐 getSession result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        error: error?.message
      });
      
      if (session?.user) {
        console.log('✅ User found:', session.user.id);
        setUser(session.user);
        await refreshUserProfile(session.user);
      } else {
        console.log('❌ No session found');
        setLoadingProfile(false);
      }
      setLoadingAuth(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);

        if (authUser) {
          await refreshUserProfile(authUser);
        } else {
          setUserProfile(null);
          setLoadingProfile(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // --------------------------------------------------
  // Sign in
  // --------------------------------------------------
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    setUser(data.user);
    await refreshUserProfile(data.user);

    return data.user;
  };

  // --------------------------------------------------
  // Sign up
  // --------------------------------------------------
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    setUser(data.user);
    await refreshUserProfile(data.user);

    return { user: data.user, isNewUser: true };
  };

  // --------------------------------------------------
  // Restore Purchases - for App Store compliance
  // Sends each restored receipt to backend for verification
  // --------------------------------------------------
  const restorePurchases = async () => {
    if (Platform.OS !== "ios") {
      console.log("🍎 Restore: Not on iOS, skipping");
      Alert.alert("Not Available", "Restore purchases is only available on iOS.");
      return;
    }

    if (!user?.id) {
      console.log("🍎 Restore: No user logged in");
      Alert.alert("Error", "Please log in to restore purchases.");
      return;
    }

    try {
      console.log("🍎 ═══════════════════════════════════════");
      console.log("🍎 RESTORE PURCHASES STARTED");
      console.log("🍎 User ID:", user.id.slice(0, 8) + "...");
      console.log("🍎 ═══════════════════════════════════════");

      const purchases = await getAvailablePurchases();
      console.log("🍎 Found", purchases.length, "purchase(s) to restore");

      if (purchases.length === 0) {
        console.log("🍎 No purchases found to restore");
        Alert.alert("No Purchases", "No previous purchases found to restore.");
        return;
      }

      const environment = getEnvironment();
      let restoredCount = 0;

      for (const purchase of purchases) {
        console.log("🍎 Restoring purchase:", purchase.productId);
        console.log("🍎 Transaction ID:", purchase.transactionId);

        if (!purchase.transactionReceipt) {
          console.log("🍎 WARNING: No receipt for purchase, skipping");
          continue;
        }

        try {
          // Send receipt to backend for verification
          const response = await fetch(`${API_BASE_URL}/api/verify-iap-receipt`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": user.id,
            },
            body: JSON.stringify({
              receiptData: purchase.transactionReceipt,
              productId: purchase.productId,
              transactionId: purchase.transactionId,
              environment: environment,
            }),
          });

          console.log("🍎 Backend response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("🍎 Receipt verified successfully:", data);
            restoredCount++;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.log("🍎 Receipt verification failed:", errorData);
          }
        } catch (err: any) {
          console.log("🍎 Error verifying receipt:", err?.message || err);
        }
      }

      console.log("🍎 ═══════════════════════════════════════");
      console.log("🍎 RESTORE COMPLETE:", restoredCount, "of", purchases.length);
      console.log("🍎 ═══════════════════════════════════════");

      // Refresh user profile to get updated plan
      await refreshUserProfile();

      if (restoredCount > 0) {
        Alert.alert("Success!", "Your purchases have been restored.");
      } else {
        Alert.alert("Restore Failed", "Could not verify your previous purchases. Please contact support.");
      }
    } catch (err: any) {
      console.log("🍎 Restore purchases error:", err?.message || err);
      Alert.alert("Error", "Could not restore purchases. Please try again.");
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const logout = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Logout: Supabase signOut failed:", signOutError);
        throw signOutError;
      }

      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loadingProfile,
        loadingAuth,
        signIn,
        signUp,
        logout,
        refreshUserProfile,
        restorePurchases,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
