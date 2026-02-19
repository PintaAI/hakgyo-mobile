import { useEffect } from 'react';
import { gamificationApi } from 'hakgyo-expo-sdk';
import { useAuth } from 'hakgyo-expo-sdk';

/**
 * Hook to trigger daily login event when user opens the app.
 * Awards 5 XP for the first login of the day and maintains streak.
 */
export function useDailyLogin() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Trigger daily login event
    gamificationApi.processEvent({
      event: 'DAILY_LOGIN',
      metadata: { timestamp: new Date().toISOString() }
    }).then((result) => {
      if (result.success && result.data) {
        console.log(`Daily login: +${result.data.data?.totalXP} XP`);

        // Optional: Show notification for streak milestone
        if (result.data.data?.streakMilestoneReached) {
          console.log(`Streak milestone: ${result.data.data?.currentStreak} days!`);
        }
      }
    }).catch((error) => {
      console.error('Failed to process daily login:', error);
    });
  }, [user]);
}
