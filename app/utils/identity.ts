import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns the existing device ID, or creates one and saves it.
 */
export async function getOrCreateUserId() {
  let id = await AsyncStorage.getItem('chema_device_id');
  if (!id) {
    id = uuidv4();
    await AsyncStorage.setItem('chema_device_id', id);
  }
  return id;
}

/**
 * Returns the device ID. If force=true, generates a new one.
 */
export async function getUserId(force = false) {
  let id = await AsyncStorage.getItem('chema_device_id');
  if (!id || force) {
    id = uuidv4();
    await AsyncStorage.setItem('chema_device_id', id);
  }
  return id;
}

