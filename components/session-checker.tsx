import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from 'hakgyo-expo-sdk';

export function SessionChecker() {
  const { session, loading } = useAuth();

  useEffect(() => {
    checkSession();
  }, [session, loading]);

  const checkSession = async () => {
    try {
      // Wait for auth to finish loading
      if (loading) {
        return;
      }

      // Session check is complete, hide the splash screen
      // (OTA update is disabled on dev builds, so we handle hiding here)
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error checking session:', error);
      // Hide the splash screen even if there's an error
      await SplashScreen.hideAsync();
    }
  };

  return null; // This component doesn't render anything
}
