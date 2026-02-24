import { useAuth } from 'hakgyo-expo-sdk';
import { View, ScrollView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignoutButton } from '@/components/auth/signout-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  User,
  Mail,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const gradientPalette = isDark
    ? {
        avatarRing: ['rgba(129,140,248,0.45)', 'rgba(168,85,247,0.35)'] as const,
        streak: ['rgba(249,115,22,0.20)', 'rgba(239,68,68,0.06)'] as const,
        xp: ['rgba(59,130,246,0.20)', 'rgba(6,182,212,0.06)'] as const,
        best: ['rgba(250,204,21,0.18)', 'rgba(245,158,11,0.06)'] as const,
        section: ['rgba(129,140,248,0.34)', 'rgba(99,102,241,0.18)'] as const,
      }
    : {
        avatarRing: ['rgba(165,180,252,0.40)', 'rgba(216,180,254,0.30)'] as const,
        streak: ['rgba(251,146,60,0.18)', 'rgba(254,215,170,0.02)'] as const,
        xp: ['rgba(96,165,250,0.20)', 'rgba(191,219,254,0.02)'] as const,
        best: ['rgba(250,204,21,0.18)', 'rgba(254,243,199,0.02)'] as const,
        section: ['rgba(129,140,248,0.24)', 'rgba(165,180,252,0.14)'] as const,
      };

  // Mock statistics data
  const stats = {
    bestStreak: 7,
    levelProgress: 65, // percentage
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName={`p-6 gap-6 ${Platform.OS === 'android' ? 'pb-24' : ''}`}>
        {/* Profile Header */}
        <View className="items-center gap-4 pt-4">
          <LinearGradient
            colors={gradientPalette.avatarRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 9999, padding: 4 }}
          >
            <Avatar alt="User avatar" className="h-24 w-24 border-2 border-border bg-card">
              <AvatarFallback>
                <Icon as={User} size={44} className="text-primary" />
              </AvatarFallback>
            </Avatar>
          </LinearGradient>
          <View className="items-center gap-1">
            <Text className="text-2xl font-bold text-foreground">
              {user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text className="text-base text-muted-foreground">
              Level {user?.level || 1}
            </Text>
          </View>
        </View>

        {/* Color Test Button */}
        <Button
          variant="outline"
          onPress={() => router.push('/color-test')}
          className="w-full"
        >
          <Text>Color Test</Text>
        </Button>

        {/* Quick Stats */}
        <View className="flex-row gap-3">
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={gradientPalette.streak}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.72)' }}
              >
                <Icon as={Flame} size={20} className="text-orange-700 dark:text-orange-300" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {user?.currentStreak || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">Streak</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={gradientPalette.xp}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.72)' }}
              >
                <Icon as={Zap} size={20} className="text-sky-700 dark:text-sky-300" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {user?.xp || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">XP Total</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={gradientPalette.best}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.72)' }}
              >
                <Icon as={Trophy} size={20} className="text-amber-700 dark:text-amber-300" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {stats.bestStreak}
              </Text>
              <Text className="text-xs text-muted-foreground">Best Streak</Text>
            </CardContent>
          </Card>
        </View>

        {/* Level Progress */}
        <Card className="border-border overflow-hidden">
          <LinearGradient
            colors={gradientPalette.section}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <CardContent >
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center gap-2">
                <Icon as={TrendingUp} size={20} className="text-primary" />
                <Text className="font-semibold text-foreground">Progres Level</Text>
              </View>
              <Text className="text-sm text-muted-foreground">
                {stats.levelProgress}%
              </Text>
            </View>
            <View className="h-3 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${stats.levelProgress}%` }}
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-2">
              {Math.round((stats.levelProgress / 100) * 100)} / 100 XP ke level {user?.level || 1 + 1}
            </Text>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardContent >
            <View className="flex-row items-center mb-3">
              <Icon as={Mail} size={18} className="text-muted-foreground" />
              <Text className="ml-3 text-sm text-muted-foreground flex-1">
                {user?.email || 'Not available'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Icon as={User} size={18} className="text-muted-foreground" />
              <Text className="ml-3 text-sm text-muted-foreground flex-1">
                Level {user?.level || 1}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <SignoutButton className="w-full" />
      </ScrollView>
    </SafeAreaView>
  );
}
