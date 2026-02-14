import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Text } from '@/components/ui/text';
import { BookOpen, ClipboardList, Flame, Trophy, Zap } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Image, View, ScrollView } from 'react-native';
import { useAuth } from 'hakgyo-expo-sdk';
import { Card, CardContent, } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyVocabulary } from '@/components/daily-vocabulary';
import { DailySoal } from '@/components/daily-soal';

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
      <Text className="text-xl font-bold">Hakgyo v1.1</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-6">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <HeaderTitle />
        <ThemeToggle />
      </View>

      {/* Stats Section */}
      <View className="flex-row gap-3">
        <Card className="flex-1">
          <CardContent className="p-4 items-center gap-2">
            <Icon as={Flame} size={24} className="text-foreground" />
            <View className="items-center">
              <Text className="font-bold text-xl">{user?.currentStreak || 0}</Text>
              <Text className="text-xs text-muted-foreground">Streak</Text>
            </View>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 items-center gap-2">
            <Icon as={Trophy} size={24} className="text-foreground" />
            <View className="items-center">
              <Text className="font-bold text-xl">{user?.level || 1}</Text>
              <Text className="text-xs text-muted-foreground">Level</Text>
            </View>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 items-center gap-2">
            <Icon as={Zap} size={24} className="text-foreground" />
            <View className="items-center">
              <Text className="font-bold text-xl">{user?.xp || 0}</Text>
              <Text className="text-xs text-muted-foreground">XP</Text>
            </View>
          </CardContent>
        </Card>
      </View>


      {/* Daily Vocabulary Section */}
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <Icon as={BookOpen} size={24} className="text-foreground" />
          <Text className="text-xl font-bold">Kosakata Harian</Text>
        </View>
        <DailyVocabulary />
      </View>

      {/* Daily Soal Section */}
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <Icon as={ClipboardList} size={24} className="text-foreground" />
          <Text className="text-xl font-bold">Latihan Harian</Text>
        </View>
        <DailySoal />
      </View>

      </ScrollView>
    </SafeAreaView>
  );
}
