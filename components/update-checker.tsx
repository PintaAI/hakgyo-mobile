import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';

export function UpdateChecker() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Only check for updates in production or preview builds
      if (__DEV__) {
        await SplashScreen.hideAsync();
        return;
      }

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('Update available:', update);

        // Automatically fetch and apply the update silently
        await Updates.fetchUpdateAsync();

        // Reload the app to apply the update
        await Updates.reloadAsync();
      } else {
        // No update available, hide the splash screen
        await SplashScreen.hideAsync();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      // Hide the splash screen even if there's an error
      await SplashScreen.hideAsync();
    }
  };

  return null; // This component doesn't render anything
}
