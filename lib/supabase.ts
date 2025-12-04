import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// FIX FOR EXPO GO — directly hardcode Supabase values
const SUPABASE_URL = "https://bzjacfpakzdquohsxsik.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6amFjZnBha3pkcXVvaHN4c2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDg0MDksImV4cCI6MjA4MDE4NDQwOX0.w8U3tdmAVtDEA5a8IcTA9MZ_DEpotXmOXQvUryDYnlg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

