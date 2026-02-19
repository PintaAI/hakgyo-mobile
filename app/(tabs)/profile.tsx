import { useAuth } from 'hakgyo-expo-sdk';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignoutButton } from '@/components/auth/signout-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
  Star,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user } = useAuth();

  // Mock statistics data
  const stats = {
    wordsLearned: 45,
    totalWords: 100,
    quizzesCompleted: 12,
    totalQuizzes: 20,
    averageScore: 78,
    studyTime: 120, // minutes
    bestStreak: 7,
    levelProgress: 65, // percentage
  };

  const achievements = [
    { id: 1, title: 'Pemula', description: 'Selesaikan 10 soal pertama', unlocked: true },
    { id: 2, title: 'Pembelajar', description: 'Hafal 20 kosakata', unlocked: true },
    { id: 3, title: 'Ahli', description: 'Capai skor 80% pada kuis', unlocked: false },
    { id: 4, title: 'Juara', description: 'Dapatkan streak 7 hari', unlocked: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="p-6 gap-6">
        {/* Profile Header */}
        <View className="items-center gap-4 pt-4">
          <Avatar alt="User avatar" className="h-24 w-24 border-4 border-primary/20 bg-primary/10">
            <AvatarFallback>
              <Icon as={User} size={48} className="text-primary" />
            </AvatarFallback>
          </Avatar>
          <View className="items-center gap-1">
            <Text className="text-2xl font-bold text-foreground">
              {user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text className="text-base text-muted-foreground">
              Level {user?.level || 1}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Icon as={Flame} size={24} className="text-orange-500" />
              <Text className="text-2xl font-bold text-foreground">
                {user?.currentStreak || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">Streak Hari Ini</Text>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Icon as={Zap} size={24} className="text-yellow-500" />
              <Text className="text-2xl font-bold text-foreground">
                {user?.xp || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">XP Total</Text>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Icon as={Trophy} size={24} className="text-amber-500" />
              <Text className="text-2xl font-bold text-foreground">
                {stats.bestStreak}
              </Text>
              <Text className="text-xs text-muted-foreground">Streak Terbaik</Text>
            </CardContent>
          </Card>
        </View>

        {/* Level Progress */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
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

        {/* Learning Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex-row items-center gap-2">
              <Icon as={Target} size={20} className="text-primary" />
              <Text>Statistik Belajar</Text>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Words Learned */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Icon as={BookOpen} size={18} className="text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">Kosakata Dihafal</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {stats.wordsLearned} / {stats.totalWords}
                </Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(stats.wordsLearned / stats.totalWords) * 100}%` }}
                />
              </View>
            </View>

            {/* Quizzes Completed */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Icon as={Award} size={18} className="text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">Kuis Selesai</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {stats.quizzesCompleted} / {stats.totalQuizzes}
                </Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(stats.quizzesCompleted / stats.totalQuizzes) * 100}%` }}
                />
              </View>
            </View>

            {/* Average Score */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Icon as={Star} size={18} className="text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">Rata-rata Skor</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {stats.averageScore}%
                </Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${stats.averageScore}%` }}
                />
              </View>
            </View>

            {/* Study Time */}
            <View className="flex-row justify-between items-center pt-2 border-t border-border">
              <View className="flex-row items-center gap-2">
                <Icon as={Clock} size={18} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">Waktu Belajar</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">
                {Math.floor(stats.studyTime / 60)}j {stats.studyTime % 60}m
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex-row items-center gap-2">
              <Icon as={Award} size={20} className="text-primary" />
              <Text>Pencapaian</Text>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                className={`flex-row items-center gap-3 p-3 rounded-lg ${
                  achievement.unlocked
                    ? 'bg-primary/5'
                    : 'bg-muted opacity-50'
                }`}
              >
                <View
                  className={`h-10 w-10 rounded-full items-center justify-center ${
                    achievement.unlocked
                      ? 'bg-primary/20'
                      : 'bg-muted'
                  }`}
                >
                  <Icon
                    as={Trophy}
                    size={20}
                    className={achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground text-sm">
                    {achievement.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {achievement.description}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <Icon as={Star} size={16} className="text-yellow-500" />
                )}
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardContent className="p-4">
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
