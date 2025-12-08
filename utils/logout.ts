import { supabase } from '../lib/supabase';

export async function logoutUserHard() {
  try {
    console.log("Hard logout start");
    await supabase.auth.signOut();
    console.log("Hard logout complete");
    return { ok: true };
  } catch (error) {
    console.error("HARD LOGOUT FAILED:", error);
    return { ok: false, error };
  }
}
