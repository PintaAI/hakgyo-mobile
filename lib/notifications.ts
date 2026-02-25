import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
 * Clear the stored registered push token from AsyncStorage
 * Use this when user logs out or when token needs to be refreshed
 */
export async function clearRegisteredPushToken(): Promise<void> {
  try {
    const STORAGE_KEY = '@hakgyo_registered_push_token';
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Stored push token cleared');
  } catch (error) {
    console.error('Failed to clear stored push token:', error);
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
  const STORAGE_KEY = '@hakgyo_registered_push_token';

  useEffect(() => {
    let mounted = true;

    const setupNotifications = async () => {
      try {
        // Check AsyncStorage FIRST for cached token before generating a new one
        const cachedToken = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (!mounted) return;
        
        if (cachedToken) {
          // Use cached token - no need to generate new one
          console.log('Using cached push token:', cachedToken);
          setExpoPushToken(cachedToken);
          setIsRegistered(true);
        } else {
          // No cached token, generate and register a new one
          console.log('No cached token found, generating new token...');
          const token = await registerForPushNotificationsAsync();
          
          if (!mounted) return;
          
          if (token) {
            setExpoPushToken(token);
            
            // Register token with backend
            try {
              await registerPushTokenWithBackend(token);
              
              if (mounted) {
                // Store the newly registered token
                await AsyncStorage.setItem(STORAGE_KEY, token);
                setIsRegistered(true);
                console.log('Token registered and stored successfully');
              }
            } catch (backendError) {
              console.error('Failed to register token with backend:', backendError);
              if (mounted) {
                setError('Failed to register with backend');
              }
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

// ============================================================================
// Local Notification Functions for Daily Streak Reminder
// ============================================================================

/**
 * Check if daily login has already been processed today
 * @param userEmail The user's email address
 * @returns Promise<boolean> indicating if daily login is already processed
 */
export async function isDailyLoginProcessed(userEmail: string): Promise<boolean> {
  try {
    const DAILY_LOGIN_STORAGE_KEY = 'daily_login_last_date';
    const storageKey = `${DAILY_LOGIN_STORAGE_KEY}_${userEmail}`;
    const lastLoginDate = await AsyncStorage.getItem(storageKey);
    const today = new Date().toDateString();
    return lastLoginDate === today;
  } catch (error) {
    console.error('Failed to check daily login status:', error);
    return false;
  }
}

/**
 * Schedule a local notification for daily streak reminder
 * Skips today if daily login is already processed
 * @param hour Hour of day (0-23) to send notification
 * @param minute Minute of hour (0-59) to send notification
 * @param userEmail Optional user email to check daily login status
 * @returns Promise that resolves when notification is scheduled
 */
export async function scheduleDailyStreakReminder(
  hour: number = 20,
  minute: number = 0,
  userEmail?: string
): Promise<string> {
  const trigger = new Date();
  trigger.setHours(hour, minute, 0, 0);
  
  // Check if daily login already processed today
  let skipToday = false;
  if (userEmail) {
    skipToday = await isDailyLoginProcessed(userEmail);
  }
  
  // If time has passed today or daily login already done, schedule for tomorrow
  if (trigger <= new Date() || skipToday) {
    trigger.setDate(trigger.getDate() + 1);
  }
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Don\'t break your streak!',
      body: 'Come back and learn some Korean vocabulary today!',
      sound: 'default',
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
  
  console.log('Daily streak reminder scheduled:', notificationId);
  return notificationId;
}

/**
 * Reschedule the streak reminder for the next day
 * Call this after daily login is processed to skip today's reminder
 * @param hour Hour of day (0-23) to send notification
 * @param minute Minute of hour (0-59) to send notification
 * @returns Promise that resolves when notification is rescheduled
 */
export async function rescheduleStreakReminderForTomorrow(
  hour: number = 20,
  minute: number = 0
): Promise<string> {
  const trigger = new Date();
  trigger.setDate(trigger.getDate() + 1); // Schedule for tomorrow
  trigger.setHours(hour, minute, 0, 0);
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Don\'t break your streak!',
      body: 'Come back and learn some Korean vocabulary today!',
      sound: 'default',
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
  
  console.log('Streak reminder rescheduled for tomorrow:', notificationId);
  return notificationId;
}

/**
 * Cancel a scheduled notification by ID
 * @param notificationId The ID of the notification to cancel
 */
export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log('Notification cancelled:', notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications cancelled');
}

/**
 * Get all scheduled notifications
 * @returns Array of scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Check if streak reminder is already scheduled
 * @returns Promise<boolean> indicating if reminder is scheduled
 */
export async function isStreakReminderScheduled(): Promise<boolean> {
  const scheduled = await getAllScheduledNotifications();
  return scheduled.some(
    (notif) => notif.content.data?.type === 'streak_reminder'
  );
}

/**
 * Get the stored reminder time from AsyncStorage
 * @returns Promise<{ hour: number; minute: number } | null> The reminder time or null if not set
 */
export async function getStreakReminderTime(): Promise<{ hour: number; minute: number } | null> {
  const TIME_KEY = '@hakgyo_streak_reminder_time';
  try {
    const timeStr = await AsyncStorage.getItem(TIME_KEY);
    return timeStr ? JSON.parse(timeStr) : null;
  } catch (error) {
    console.error('Failed to get reminder time:', error);
    return null;
  }
}

/**
 * Hook to manage daily streak reminder notifications with daily login integration
 * @returns Object containing scheduling status and control functions
 */
export function useStreakReminder() {
  const [isScheduled, setIsScheduled] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const STORAGE_KEY = '@hakgyo_streak_reminder_id';
  const TIME_KEY = '@hakgyo_streak_reminder_time';

  useEffect(() => {
    checkScheduledReminder();
  }, []);

  const checkScheduledReminder = async () => {
    try {
      const storedId = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedId) {
        const scheduled = await getAllScheduledNotifications();
        const exists = scheduled.some((n) => n.identifier === storedId);
        if (exists) {
          setNotificationId(storedId);
          setIsScheduled(true);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to check scheduled reminder:', error);
    }
  };

  const scheduleReminder = async (
    hour: number = 20,
    minute: number = 0,
    userEmail?: string
  ) => {
    try {
      // Cancel existing reminder if any
      if (notificationId) {
        await cancelScheduledNotification(notificationId);
      }

      // Schedule with daily login check
      const id = await scheduleDailyStreakReminder(hour, minute, userEmail);
      setNotificationId(id);
      setIsScheduled(true);
      
      await AsyncStorage.setItem(STORAGE_KEY, id);
      await AsyncStorage.setItem(TIME_KEY, JSON.stringify({ hour, minute }));
      
      return id;
    } catch (error) {
      console.error('Failed to schedule streak reminder:', error);
      throw error;
    }
  };

  const cancelReminder = async () => {
    try {
      if (notificationId) {
        await cancelScheduledNotification(notificationId);
        setNotificationId(null);
        setIsScheduled(false);
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem(TIME_KEY);
      }
    } catch (error) {
      console.error('Failed to cancel streak reminder:', error);
      throw error;
    }
  };

  const getReminderTime = async (): Promise<{ hour: number; minute: number } | null> => {
    try {
      const timeStr = await AsyncStorage.getItem(TIME_KEY);
      return timeStr ? JSON.parse(timeStr) : null;
    } catch (error) {
      console.error('Failed to get reminder time:', error);
      return null;
    }
  };

  return {
    isScheduled,
    scheduleReminder,
    cancelReminder,
    getReminderTime,
  };
}
