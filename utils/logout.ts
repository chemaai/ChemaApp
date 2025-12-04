import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function logoutUserHard() {
  try {
    console.log("Hard logout start");

    // Supabase logout
    await supabase.auth.signOut();

    // Keep existing anonymous device ID
    const existingId = await AsyncStorage.getItem('chema_device_id');

    // Clear all storage
    await AsyncStorage.clear();

    // Restore anonymous device ID
    if (existingId) {
      await AsyncStorage.setItem('chema_device_id', existingId);
    }

    console.log("Hard logout complete");
    return { ok: true };
  } catch (error) {
    console.error("HARD LOGOUT FAILED:", error);
    return { ok: false, error };
  }
}

