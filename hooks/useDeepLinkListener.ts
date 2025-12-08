import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';

export default function useDeepLinkListener() {
  const { refreshUserProfile } = useAuthContext() as { refreshUserProfile: () => Promise<void> };

  useEffect(() => {
    const handleDeepLink = async (event: any) => {
      const url = event.url;
      console.log('🔗 Deep link received:', url);

      if (!url) return;

      if (url.includes('payment-success')) {
        console.log('💳 Payment success detected! Refreshing profile…');
        await refreshUserProfile();
        router.replace('/chat');
        return;
      }

      if (url.includes('payment-cancel')) {
        console.log('❌ Payment canceled');
        router.replace('/subscription');
        return;
      }
    };

    const listener = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) handleDeepLink({ url: initialUrl });
    });

    return () => {
      listener.remove();
    };
  }, [refreshUserProfile]);
}

