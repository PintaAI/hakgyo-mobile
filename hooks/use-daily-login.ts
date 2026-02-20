import { useEffect } from 'react';
import { gamificationApi } from 'hakgyo-expo-sdk';
import { useAuth } from 'hakgyo-expo-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_LOGIN_STORAGE_KEY = 'daily_login_last_date';

/**
 * Hook to trigger daily login event when user opens the app.
 * Awards 5 XP for the first login of the day and maintains streak.
 * Only triggers once per day per user.
 */
export function useDailyLogin() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const processDailyLogin = async () => {
      try {
        const today = new Date().toDateString();
        const storageKey = `${DAILY_LOGIN_STORAGE_KEY}_${user.email}`;
        const lastLoginDate = await AsyncStorage.getItem(storageKey);

        // Check if already logged in today
        if (lastLoginDate === today) {
          console.log('Daily login already processed for today');
          return;
        }

        // Trigger daily login event
        const result = await gamificationApi.processEvent({
          event: 'DAILY_LOGIN',
          metadata: { timestamp: new Date().toISOString() }
        });

        if (result.success && result.data) {
          console.log(`Daily login: +${result.data.data?.totalXP} XP`);

          // Store today's date to prevent multiple triggers
          await AsyncStorage.setItem(storageKey, today);

          // Optional: Show notification for streak milestone
          if (result.data.data?.streakMilestoneReached) {
            console.log(`Streak milestone: ${result.data.data?.currentStreak} days!`);
          }
        }
      } catch (error) {
        console.error('Failed to process daily login:', error);
      }
    };

    processDailyLogin();
  }, [user]);
}
