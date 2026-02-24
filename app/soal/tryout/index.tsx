import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TryoutCard } from '@/components/soal/tryout-card';
import { HelpCircle, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { tryoutApi, type Tryout } from 'hakgyo-expo-sdk';

export default function TryoutListScreen() {
  const router = useRouter();
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await tryoutApi.listActive();
      console.log('Tryout API Response:', response);
      console.log('Tryout API Response data:', response.data);
      console.log('Tryout API Response success:', response.success);

      if (response.success && response.data) {
        // The SDK may wrap response: { success: true, data: { data: [...] } }
        const rawData = response.data as any;
        const tryoutData: Tryout[] = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
          ? rawData.data
          : [];
        console.log('Parsed tryoutData:', tryoutData);
        setTryouts(tryoutData);
      } else {
        console.error('Tryout API failed:', response.error);
        setError('Gagal memuat data tryout');
      }
    } catch (err) {
      console.error('Error fetching tryouts:', err);
      setError('Terjadi kesalahan saat memuat data tryout');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, []);

  const handleTryoutPress = (tryoutId: number) => {
    router.push({ pathname: '/soal/tryout/[id]', params: { id: String(tryoutId) } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Background />
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="w-8 h-8">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Button>
            <View className="flex-1">
              <Text className="text-xl font-semibold">Tryout</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {tryouts.length} tryout tersedia
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading || refreshing ? (
            <View className={`p-4 gap-3 ${Platform.OS === 'android' ? 'pb-20' : ''}`}>
              {[...Array(3)].map((_, i) => (
                <View key={i} className="border border-border/50 rounded-lg p-4 gap-3">
                  {/* Header Skeleton */}
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 gap-1.5">
                      <Skeleton className="h-5 w-3/4 rounded-md" />
                      <View className="flex-row items-center gap-2">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                      </View>
                    </View>
                    <Skeleton className="w-5 h-5 rounded-md" />
                  </View>
                  {/* Description Skeleton */}
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  {/* Stats Skeleton */}
                  <View className="flex-row items-center gap-2.5">
                    <Skeleton className="w-20 h-6 rounded-full" />
                    <Skeleton className="w-20 h-6 rounded-full" />
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </View>
                  {/* Time Info Skeleton */}
                  <View className="pt-2 border-t border-border/30 gap-1.5">
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-3 w-full rounded-md" />
                  </View>
                </View>
              ))}
            </View>
          ) : error ? (
            <View className={`p-4 ${Platform.OS === 'android' ? 'pb-20' : ''}`}>
              <Alert icon={AlertCircle} variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onPress={() => fetchData()} className="mt-4">
                <Text className="text-primary-foreground">Coba Lagi</Text>
              </Button>
            </View>
          ) : tryouts.length === 0 ? (
            <View className={`p-4 items-center justify-center ${Platform.OS === 'android' ? 'pb-20' : ''}`}>
              <Icon as={HelpCircle} size={48} className="text-muted-foreground mb-4" />
              <Text className="text-muted-foreground text-center">
                Belum ada tryout tersedia
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-2">
                Tunggu guru mengaktifkan tryout
              </Text>
            </View>
          ) : (
            <View className={`p-4 gap-3 ${Platform.OS === 'android' ? 'pb-20' : ''}`}>
              {tryouts.map((tryout) => (
                <TryoutCard
                  key={tryout.id}
                  tryout={tryout}
                  onPress={() => handleTryoutPress(tryout.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
