import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { useStreakReminder,} from '@/lib/notifications';
import { useAuth } from 'hakgyo-expo-sdk';
import { useState, useEffect } from 'react';

export function StreakReminderSettings() {
  const { user } = useAuth();
  const { isScheduled, scheduleReminder, cancelReminder } = useStreakReminder();
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEnabled(isScheduled);
  }, [isScheduled]);

  const toggleReminder = async () => {
    setIsLoading(true);
    try {
      if (enabled) {
        await cancelReminder();
        setEnabled(false);
      } else {
        await scheduleReminder(20, 0, user?.email);
        setEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle streak reminder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-row items-center justify-between p-4 bg-card rounded-lg border border-border">
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">
          Daily Streak Reminder
        </Text>
        <Text className="text-sm text-muted-foreground">
          {enabled ? '8:00 PM' : 'Off'}
        </Text>
      </View>
      <Switch
        checked={enabled}
        onCheckedChange={toggleReminder}
        disabled={isLoading}
      />
    </View>
  );
}
