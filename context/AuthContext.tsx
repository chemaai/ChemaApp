import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

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
        .select("id, supabase_user_id, plan, stripe_customer_id")
        .eq("supabase_user_id", activeUser.id);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await refreshUserProfile(session.user);
      } else {
        setLoadingProfile(false);
      }
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
  // Update user plan from IAP purchase
  // --------------------------------------------------
  const updateUserPlanFromIAP = async (plan: string) => {
    try {
      if (!user?.id) {
        console.log("🍎 Cannot update plan - no user logged in");
        return;
      }

      console.log("🍎 Updating user plan to:", plan, "for user:", user.id.slice(0, 8) + "...");

      // Call backend to update plan (backend should verify receipt)
      const response = await fetch("https://chema-00yh.onrender.com/api/update-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": user.id,
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("🍎 Backend plan update failed:", errorData);
        // Fallback: update directly in Supabase
        const { error } = await supabase
          .from("users")
          .update({ plan })
          .eq("supabase_user_id", user.id);
        
        if (error) {
          console.log("🍎 Supabase direct update failed:", error);
          throw error;
        }
        console.log("🍎 Plan updated directly in Supabase (fallback)");
      } else {
        console.log("🍎 Plan updated via backend");
      }

      // Refresh the local profile
      await refreshUserProfile();
    } catch (err) {
      console.log("🍎 Failed to update plan:", err);
      throw err;
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
        signIn,
        signUp,
        logout,
        refreshUserProfile,
        updateUserPlanFromIAP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
