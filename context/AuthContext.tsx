import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Add userProfile to our context state
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true); // NEW

  // --------------------------------------------------
  // Fetch user profile from public.users (not public.profiles)
  // Selects only: id, supabase_user_id, plan, stripe_customer_id
  // Handles multiple rows - prefers the one with stripe_customer_id
  // --------------------------------------------------
  async function refreshUserProfile(currentUser = null) {
    try {
      const activeUser = currentUser || user;
      if (!activeUser?.id) {
        setLoadingProfile(false);
        return;
      }

      // Query public.users - get ALL rows for this user (there might be multiple)
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
        // (skip the "free" rows that were created incorrectly)
        const recordWithStripe = data.find((r: any) => r.stripe_customer_id);
        const profileData = recordWithStripe || data[0]; // Use record with Stripe ID, or first one
        
        setUserProfile(profileData);
      } else {
        // No record found - set to null
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
        await refreshUserProfile(session.user); // this sets loadingProfile false at end
      } else {
        setLoadingProfile(false); // NEW
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);

        // NEW: Whenever auth changes, refresh the profile
        if (authUser) {
          await refreshUserProfile(authUser); // ends in loadingProfile=false
        } else {
          setUserProfile(null);
          setLoadingProfile(false); // NEW
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

    // NEW: fetch Supabase plan on login
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

    // NEW: fetch initial plan on sign-up (should be "free")
    await refreshUserProfile(data.user);

    // Optional: Your UI can trigger upgrade modal based on this
    return { user: data.user, isNewUser: true };
  };

  const logout = async () => {
    try {
      // 1. Log out of Supabase (critical - must succeed)
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Logout: Supabase signOut failed:", signOutError);
        throw signOutError;
      }

      // 2. Clear authenticated user state immediately
      setUser(null);
      setUserProfile(null);

      // Note: Device ID is preserved to maintain Stripe customer link

    } catch (err) {
      console.error("Logout failed (critical error):", err);
      // Re-throw so button handler can catch it
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        signIn,
        signUp,
        logout,
        refreshUserProfile, // Exposed in case UI ever needs it
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
