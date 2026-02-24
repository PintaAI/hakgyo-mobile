import { useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Flame, Trophy, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '@/lib/theme';

interface UserStatsProps {
  streak: number;
  bestStreak?: number;
  level: number;
  xp: number;
}

export function UserStats({ streak, bestStreak, level, xp }: UserStatsProps) {
  const { colorScheme } = useColorScheme();

  // Calculate which days of the week should show the flame based on streak
  const streakDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const days = [false, false, false, false, false, false, false]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    // Map current day to our 0-6 index (Mon=0, Tue=1, ..., Sun=6)
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1;

    // Mark days with flame based on streak count
    for (let i = 0; i < streak && i < 7; i++) {
      const dayIndex = (todayIndex - i + 7) % 7;
      days[dayIndex] = true;
    }

    return days;
  }, [streak]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];


  return (
    <View className="gap-3">
      {/* Level and XP cards row */}
      <View className="flex-row gap-3">
        <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
          <LinearGradient
            colors={GRADIENTS[colorScheme ?? 'light'].level}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          >
          </LinearGradient>
          <CardContent className="items-center gap-2">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: GRADIENTS[colorScheme ?? 'light'].iconBackground }}
            >
              <Icon as={Trophy} size={20} className="text-primary dark:text-primary-foreground" />
            </View>
            <View className="items-center">
              <Text className="font-bold text-xl text-foreground">{level}</Text>
              <Text className="text-xs text-muted-foreground">Level</Text>
            </View>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
          <LinearGradient
            colors={GRADIENTS[colorScheme ?? 'light'].xp}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          >
          </LinearGradient>
          <CardContent className="items-center gap-2">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: GRADIENTS[colorScheme ?? 'light'].iconBackground }}
            >
              <Icon as={Zap} size={20} className="text-success dark:text-success-foreground" />
            </View>
            <View className="items-center">
              <Text className="font-bold text-xl text-foreground">{xp}</Text>
              <Text className="text-xs text-muted-foreground">XP</Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Streak card row */}
      <Card className="bg-card p-2 shadow-md elevation-5 overflow-hidden border border-border">
        <LinearGradient
          colors={GRADIENTS[colorScheme ?? 'light'].streak}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
        </LinearGradient>
        <CardContent className="items-center gap-1 px-2">
          <View className="w-full">
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center gap-1">
                <Icon as={Flame} size={16} className="text-fail dark:text-fail-foreground" />
                <Text className="font-bold text-base text-foreground">{streak}</Text>
                <Text className="text-xs text-muted-foreground">day streak</Text>
              </View>
              {bestStreak !== undefined && bestStreak > 0 && (
                <View className="flex-row items-center gap-1">
                  <Text className="text-[10px] text-muted-foreground">Best:</Text>
                  <Text className="font-semibold text-xs text-primary">{bestStreak}</Text>
                </View>
              )}
            </View>
            <View className="flex-row justify-between">
              {dayLabels.map((label, index) => (
                <View key={index} className="items-center gap-1">
                  <Text className="text-[10px] text-muted-foreground">{label}</Text>
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: streakDays[index]
                        ? GRADIENTS[colorScheme ?? 'light'].streakDayActive
                        : GRADIENTS[colorScheme ?? 'light'].streakDayInactive,
                    }}
                  >
                    {streakDays[index] && (
                      <Icon as={Flame} size={14} className="text-fail dark:text-fail-foreground" />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
