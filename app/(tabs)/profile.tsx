import { useAuth, userApi, type Kelas } from 'hakgyo-expo-sdk';
import { View, ScrollView, Platform, ActivityIndicator, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent,} from '@/components/ui/card';
import { SignoutButton } from '@/components/auth/signout-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GRADIENTS } from '@/lib/theme';
import {
  User,
  Flame,
  Zap,
  Trophy,
  BookOpen,
  Users,
  GraduationCap,
  AlertCircle,
  DollarSign,
  Star,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [joinedKelas, setJoinedKelas] = useState<Kelas[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [kelasError, setKelasError] = useState<string | null>(null);

  // Fetch joined classes
  useEffect(() => {
    const fetchJoinedKelas = async () => {
      if (!user?.id) return;
      
      setLoadingKelas(true);
      setKelasError(null);
      
      try {
        const response = await userApi.getClasses(user.id);
        if (response.success && response.data) {
          // Handle both direct array response and paginated response
          const data = response.data as any;
          const kelasData = Array.isArray(data)
            ? data
            : data?.data || [];
          setJoinedKelas(kelasData);
        } else {
          setKelasError(response.error || 'Failed to load classes');
        }
      } catch (error) {
        console.error('Error fetching joined kelas:', error);
        setKelasError('Failed to load classes');
      } finally {
        setLoadingKelas(false);
      }
    };

    fetchJoinedKelas();
  }, [user?.id]);



  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Background />
      <ScrollView className="flex-1" contentContainerClassName={`p-4 gap-6 ${Platform.OS === 'android' ? 'pb-24' : 'pb-24'}`}>
        {/* Profile Header */}
        <View className="items-center gap-4 pt-4">
          <LinearGradient
            colors={GRADIENTS[colorScheme ?? 'light'].level}
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
            <Text className="text-sm text-muted-foreground">
              {user?.email}
            </Text>
          </View>
        </View>


        {/* Quick Stats */}
        <View className="flex-row gap-3">
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={GRADIENTS[colorScheme ?? 'light'].streak}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: GRADIENTS[colorScheme ?? 'light'].iconBackground }}
              >
                <Icon as={Flame} size={20} className="text-fail dark:text-fail-foreground" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {user?.currentStreak || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">Streak</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={GRADIENTS[colorScheme ?? 'light'].xp}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: GRADIENTS[colorScheme ?? 'light'].iconBackground }}
              >
                <Icon as={Zap} size={20} className="text-success dark:text-success-foreground" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {user?.xp || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">XP Total</Text>
            </CardContent>
          </Card>
        </View>

        {/* Level and Longest Streak */}
        <View className="flex-row gap-3">
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={GRADIENTS[colorScheme ?? 'light'].level}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: GRADIENTS[colorScheme ?? 'light'].iconBackground }}
              >
                <Icon as={Trophy} size={20} className="text-primary dark:text-primary-foreground" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {user?.level || 1}
              </Text>
              <Text className="text-xs text-muted-foreground">Level</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card shadow-md elevation-5 overflow-hidden border border-border">
            <LinearGradient
              colors={GRADIENTS[colorScheme ?? 'light'].level}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <CardContent className=" items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: GRADIENTS[colorScheme ?? 'light'].iconBackground }}
              >
                <Icon as={Trophy} size={20} className="text-primary dark:text-primary-foreground" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {user?.longestStreak || 0}
              </Text>
              <Text className="text-xs text-muted-foreground">Longest Streak</Text>
            </CardContent>
          </Card>
        </View>

        {/* Joined Classes */}
        <Card className="border-0 bg-transparent">
          <CardContent>
            <View className="flex-row items-center gap-2 mb-3">
              <Icon as={GraduationCap} size={20} className="text-primary" />
              <Text className="font-semibold text-foreground">Kelas Bergabung</Text>
              <View className="ml-auto bg-primary/20 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-medium text-primary">
                  {joinedKelas.length}
                </Text>
              </View>
            </View>

            {loadingKelas ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                <Text className="text-sm text-muted-foreground mt-2">Loading kelas...</Text>
              </View>
            ) : kelasError ? (
              <Alert variant="destructive" icon={AlertCircle}>
                <AlertDescription>{kelasError}</AlertDescription>
              </Alert>
            ) : joinedKelas.length === 0 ? (
              <View className="items-center py-6 gap-2">
                <Icon as={BookOpen} size={32} className="text-muted-foreground/50" />
                <Text className="text-sm text-muted-foreground">Belum bergabung dengan kelas</Text>
              </View>
            ) : (
              <View className="gap-3">
                {joinedKelas.map((kelas) => (
                  <View
                    key={kelas.id}
                    className="bg-card/80 dark:bg-card/60 rounded-lg overflow-hidden border border-border/50"
                  >
                    <View className="h-48">
                      {/* Top half - Thumbnail with title overlay */}
                      <View className="h-1/2 relative">
                        {kelas.thumbnail ? (
                          <Image
                            source={{ uri: kelas.thumbnail }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full bg-primary/10 items-center justify-center">
                            <Icon as={BookOpen} size={32} className="text-primary/50" />
                          </View>
                        )}
                        {/* Title overlay */}
                        <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <View className="absolute bottom-2 left-2 right-2">
                          <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                            {kelas.title}
                          </Text>
                        </View>
                      </View>

                      {/* Bottom half - Description and details */}
                      <View className="h-1/2 p-2.5 flex-col justify-between">
                        <View>
                          <View className="flex-row items-center gap-1.5 mb-1">
                            <View className="flex-row items-center gap-0.5 bg-primary/10 px-1 py-0.5 rounded">
                              <Star size={6} className="text-primary" />
                              <Text className="text-[10px] text-primary font-medium">{kelas.level}</Text>
                            </View>
                            <Text className="text-[10px] text-muted-foreground">{kelas.type}</Text>
                            {kelas.isPaidClass && (
                              <View className="flex-row items-center gap-0.5 bg-amber-500/20 px-1 py-0.5 rounded">
                                <DollarSign size={8} className="text-amber-600 dark:text-amber-400" />
                                <Text className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                  {kelas.price || 'Paid'}
                                </Text>
                              </View>
                            )}
                          </View>
                          {kelas.description && (
                            <Text className="text-[10px] text-muted-foreground leading-tight" numberOfLines={2}>
                              {kelas.description}
                            </Text>
                          )}
                        </View>
                        {kelas.author && (
                          <View className="flex-row items-center gap-1 mt-1">
                            <Icon as={Users} size={10} className="text-muted-foreground" />
                            <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>
                              {kelas.author.name || kelas.author.email}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>
        {/* Color Test Button */}
        <Button
          variant="outline"
          onPress={() => router.push('/color-test')}
          className="w-full"
        >
          <Text>Color Test</Text>
        </Button>

        {/* Sign Out */}
        <SignoutButton className="w-full" />
      </ScrollView>
    </SafeAreaView>
  );
}

