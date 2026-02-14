import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { notificationsApi } from 'hakgyo-expo-sdk';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  }),
});

/**
 * Set up Android notification channel
 */
async function setupAndroidNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/**
 * Handle registration errors
 */
function handleRegistrationError(errorMessage: string) {
  console.error('Push notification registration error:', errorMessage);
  throw new Error(errorMessage);
}

/**
 * Register for push notifications and get ExpoPushToken
 * @returns ExpoPushToken string or null if failed
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Set up Android notification channel
  await setupAndroidNotificationChannel();

  // Check if running on a physical device
  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for push notifications');
    return null;
  }

  // Request notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return null;
  }

  // Get project ID
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  
  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return null;
  }

  // Get ExpoPushToken
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log('ExpoPushToken:', pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
    return null;
  }
}

/**
 * Get a unique device identifier
 * @returns Device ID string
 */
function getDeviceId(): string {
  // Try to get device ID from Constants, otherwise generate one
  return Constants.deviceId || Constants.sessionId || 'unknown-device';
}

/**
 * Register push token with the backend API
 * @param pushToken The ExpoPushToken to register
 * @returns Promise that resolves when registration is complete
 */
export async function registerPushTokenWithBackend(pushToken: string): Promise<void> {
  try {
    const deviceId = getDeviceId();
    console.log('Registering push token with backend:', { pushToken, deviceId });
    
    await notificationsApi.registerToken(pushToken, deviceId);
    console.log('Push token registered successfully with backend');
  } catch (error) {
    console.error('Failed to register push token with backend:', error);
    throw error;
  }
}

/**
 * Unregister push token from the backend API
 * @param tokenId The token ID to unregister
 * @returns Promise that resolves when unregistration is complete
 */
export async function unregisterPushTokenFromBackend(tokenId: string): Promise<void> {
  try {
    console.log('Unregistering push token from backend:', tokenId);
    
    await notificationsApi.unregisterToken(tokenId);
    console.log('Push token unregistered successfully from backend');
  } catch (error) {
    console.error('Failed to unregister push token from backend:', error);
    throw error;
  }
}

/**
 * Send a push notification to a specific ExpoPushToken
 * @param expoPushToken The token to send the notification to
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data to include with the notification
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}

/**
 * Set up notification listeners
 * @param onNotificationReceived Callback for when a notification is received
 * @param onNotificationResponse Callback for when user interacts with notification
 * @returns Cleanup function to remove listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    }
  );

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Hook to manage push notifications in a component
 * @returns Object containing expoPushToken, notification, and error
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((err) => {
        setError(`${err}`);
        console.error('Failed to register for push notifications:', err);
      });

    const cleanup = setupNotificationListeners(
      setNotification,
      (response) => console.log('Notification response:', response)
    );

    return cleanup;
  }, []);

  return { expoPushToken, notification, error };
}

/**
 * Hook to manage push notifications with automatic backend registration
 * @returns Object containing expoPushToken, notification, error, and registration status
 */
export function usePushNotificationsWithBackend() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let mounted = true;

    const setupNotifications = async () => {
      try {
        // Register for push notifications
        const token = await registerForPushNotificationsAsync();
        
        if (!mounted) return;
        
        if (token) {
          setExpoPushToken(token);
          
          // Register token with backend
          try {
            await registerPushTokenWithBackend(token);
            if (mounted) {
              setIsRegistered(true);
            }
          } catch (backendError) {
            console.error('Failed to register token with backend:', backendError);
            if (mounted) {
              setError('Failed to register with backend');
            }
          }
        }
      } catch (err) {
        console.error('Failed to register for push notifications:', err);
        if (mounted) {
          setError(`${err}`);
        }
      }
    };

    setupNotifications();

    const cleanup = setupNotificationListeners(
      setNotification,
      (response) => console.log('Notification response:', response)
    );

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return { expoPushToken, notification, error, isRegistered };
}
