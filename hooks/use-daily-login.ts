import { useEffect, useState } from 'react';
import { gamificationApi } from 'hakgyo-expo-sdk';
import { useAuth } from 'hakgyo-expo-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStreakReminderTime, rescheduleStreakReminderForTomorrow } from '@/lib/notifications';

const DAILY_LOGIN_STORAGE_KEY = 'daily_login_last_date';

export interface DailyLoginData {
  xpGained: number;
  currentStreak: number;
  streakMilestoneReached: boolean;
  level?: number;
}

/**
 * Hook to trigger daily login event when user opens the app.
 * Awards 5 XP for the first login of the day and maintains streak.
 * Only triggers once per day per user.
 * 
 * @returns {Object} Contains the popup state and daily login data
 * @returns {boolean} showPopup - Whether to show the daily login popup
 * @returns {DailyLoginData | null} dailyLoginData - Data for the daily login popup
 * @returns {() => void} dismissPopup - Function to dismiss the popup
 */
export function useDailyLogin() {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [dailyLoginData, setDailyLoginData] = useState<DailyLoginData | null>(null);

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
          const xpGained = result.data.data?.totalXP || 0;
          const currentStreak = result.data.data?.currentStreak || 0;
          const streakMilestoneReached = result.data.data?.streakMilestoneReached || false;
          
          console.log(`Daily login: +${xpGained} XP, Streak: ${currentStreak} days`);

          // Store today's date to prevent multiple triggers
          await AsyncStorage.setItem(storageKey, today);

          // Set data for popup
          setDailyLoginData({
            xpGained,
            currentStreak,
            streakMilestoneReached,
            level: user.level,
          });
          
          // Show popup
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Failed to process daily login:', error);
      }
    };

    processDailyLogin();
  }, [user]);

  const dismissPopup = () => {
    setShowPopup(false);
  };

  /**
   * Reschedule the streak reminder for tomorrow after daily login is processed
   * This prevents the reminder from firing on the same day the user already logged in
   */
  const rescheduleReminderAfterLogin = async () => {
    try {
      const time = await getStreakReminderTime();
      if (time) {
        await rescheduleStreakReminderForTomorrow(time.hour, time.minute);
        console.log('Streak reminder rescheduled for tomorrow after daily login');
      }
    } catch (error) {
      console.error('Failed to reschedule streak reminder after daily login:', error);
    }
  };

  return { showPopup, dailyLoginData, dismissPopup, rescheduleReminderAfterLogin };
}
