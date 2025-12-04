import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns existing device ID or creates a new one.
 * Used for anonymous free users & message limits.
 */
export async function getOrCreateUserId() {
  try {
    const existing = await AsyncStorage.getItem('CHEMA_DEVICE_ID');
    if (existing) return existing;

    const newId = uuidv4();
    await AsyncStorage.setItem('CHEMA_DEVICE_ID', newId);
    return newId;
  } catch (err) {
    console.log("getOrCreateUserId error:", err);
    const fallback = uuidv4();
    return fallback;
  }
}

/**
 * Returns device ID, or forces a reset (used for logout)
 */
export async function getUserId(forceNew = false) {
  try {
    if (forceNew) {
      const newId = uuidv4();
      await AsyncStorage.setItem('CHEMA_DEVICE_ID', newId);
      return newId;
    }

    const existing = await AsyncStorage.getItem('CHEMA_DEVICE_ID');
    if (existing) return existing;

    const newId = uuidv4();
    await AsyncStorage.setItem('CHEMA_DEVICE_ID', newId);
    return newId;
  } catch (err) {
    const fallback = uuidv4();
    return fallback;
  }
}

