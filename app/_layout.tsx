import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

// NEW IMPORTS FOR USER ID SYNC
import { useEffect } from 'react';
import { getUserId } from '../utils/identity';

export default function RootLayout() {

  // NEW: Sync user to backend on app startup
  useEffect(() => {
    async function syncUser() {
      try {
        const userId = await getUserId();

        await fetch("https://chema-00yh.onrender.com/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        });

      } catch (error) {
        console.error("Sync-user failed:", error);
      }
    }

    syncUser(); // fire once on app open
  }, []);

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}


