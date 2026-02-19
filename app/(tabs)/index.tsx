import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Text } from '@/components/ui/text';
import { BookOpen, ClipboardList } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Image, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from 'hakgyo-expo-sdk';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DailyVocabulary } from '@/components/daily-vocabulary';
import { DailySoal } from '@/components/daily-soal';
import { useDailyLogin } from '@/hooks/use-daily-login';
import { UserStats } from '@/components/user-stats';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/icon';
import { GRADIENTS } from '@/lib/theme';

const LOGO = {
  light: require('@/assets/images/splash-icon.png'),
  dark: require('@/assets/images/splash-icon-dark.png'),
};

function HeaderTitle() {
  const { colorScheme } = useColorScheme();
  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={LOGO[colorScheme ?? 'light']}
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
      <Text className="text-xl font-bold">Hakgyo v1.1.2</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dailyVocabInputFocusedRef = useRef(false);
  const [isDailyVocabInputFocused, setIsDailyVocabInputFocused] = useState(false);
  
  // Optimistic stats state
  const [optimisticXP, setOptimisticXP] = useState(0);
  const [optimisticLevel, setOptimisticLevel] = useState(0);


  // Trigger daily login event when user opens the app
  useDailyLogin();

  // Calculate level from XP: level = Math.floor(Math.sqrt(totalXP / 100)) + 1
  const calculateLevel = (xp: number): number => Math.floor(Math.sqrt(xp / 100)) + 1;

  // Handle optimistic stats update from DailyVocabulary
  const handleStatsUpdate = useCallback((xpGained: number) => {
    setOptimisticXP((prevXP) => {
      const newXP = prevXP + xpGained;
      setOptimisticLevel(calculateLevel(newXP));
      return newXP;
    });
  }, []);

  // Reset optimistic state when user data changes (e.g., after refresh)
  useEffect(() => {
    if (user) {
      setOptimisticXP(user.xp || 0);
      setOptimisticLevel(user.level || 1);
    }
  }, [user]);

  const handleDailyVocabInputFocusChange = useCallback((isFocused: boolean) => {
    dailyVocabInputFocusedRef.current = isFocused;
    setIsDailyVocabInputFocused(isFocused);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={isDailyVocabInputFocused || dailyVocabInputFocusedRef.current}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 + insets.bottom : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 gap-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 60 + insets.bottom }}
        >
        {/* Header */}
        <View className="flex-row justify-between items-center">
          <HeaderTitle />
          <ThemeToggle />
        </View>

        {/* Stats Section */}
        <UserStats
          streak={user?.currentStreak || 0}
          level={optimisticLevel || user?.level || 1}
          xp={optimisticXP || user?.xp || 0}
        />


        {/* Daily Vocabulary Section */}
        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <LinearGradient
              colors={GRADIENTS[colorScheme ?? 'light'].vocabChip}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 10 }}
            >
              <View className="p-2">
                <Icon as={BookOpen} size={20} className="text-foreground" />
              </View>
            </LinearGradient>
            <Text className="text-xl font-bold text-foreground">Kosakata Harian</Text>
          </View>
          <DailyVocabulary
            onInputFocusChange={handleDailyVocabInputFocusChange}
            onStatsUpdate={handleStatsUpdate}
          />
        </View>

        {/* Daily Soal Section */}
        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <LinearGradient
              colors={GRADIENTS[colorScheme ?? 'light'].soalChip}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 10 }}
            >
              <View className="p-2">
                <Icon as={ClipboardList} size={20} className="text-foreground" />
              </View>
            </LinearGradient>
            <Text className="text-xl font-bold text-foreground">Latihan Harian</Text>
          </View>
          <DailySoal />
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
