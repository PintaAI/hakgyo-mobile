import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SoalSet } from '@/components/soal';
import { HelpCircle, AlertCircle, FileText, Search } from 'lucide-react-native';
import { soalApi } from 'hakgyo-expo-sdk';


export default function SoalScreen() {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
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
      const response = await soalApi.listCollections({ limit: 20, page: 1 ,onlyJoinedClasses:true });
      console.log('API Response:', response);

      if (response.success && response.data?.data) {
        // SDK wraps response: { success: true, data: { data: [...], meta: {...} } }
        setCollections(response.data.data);
      } else {
        setError('Gagal memuat data');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Terjadi kesalahan saat memuat data');
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

  const handleWebsitePress = useCallback(() => {
    Linking.openURL('https://hakgyo.vercel.app/');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Background />
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-semibold">Latihan Soal</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {collections.length} koleksi soal tersedia
              </Text>
            </View>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                router.push('/soal/tryout');
              }}
              className="flex-row items-center gap-2"
            >
              <Icon as={FileText} size={16} className="text-foreground" />
              <Text className="text-sm">Tryout</Text>
            </Button>
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
            <View className={`p-4 gap-3 ${Platform.OS === 'android' ? 'pb-20' : 'pb-20'}`}>
              {[...Array(3)].map((_, i) => (
                <View key={i} className="border border-border/50 rounded-lg p-4 gap-3">
                  {/* Icon & Title Row */}
                  <View className="flex-row items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-md" />
                    <View className="flex-1 gap-1">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </View>
                    <Skeleton className="w-5 h-5 rounded-md" />
                  </View>
                  {/* Stats Row */}
                  <View className="flex-row items-center gap-4">
                    <Skeleton className="w-16 h-3 rounded-md" />
                    <Skeleton className="w-20 h-3 rounded-md" />
                    <Skeleton className="w-20 h-3 rounded-md" />
                    <Skeleton className="w-16 h-3 rounded-md ml-auto" />
                  </View>
                  {/* Progress Bar */}
                  <Skeleton className="h-1.5 w-full rounded-full" />
                  {/* Progress Text */}
                  <View className="flex-row justify-between">
                    <Skeleton className="w-12 h-3 rounded-md" />
                    <Skeleton className="w-16 h-3 rounded-md" />
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
          ) : collections.length === 0 ? (
            <View className={`p-4 items-center justify-center ${Platform.OS === 'android' ? 'pb-20' : ''}`}>
              <Icon as={HelpCircle} size={48} className="text-muted-foreground mb-4" />
              <Text className="text-muted-foreground">Belum ada data tersedia</Text>
            </View>
          ) : (
            <View className={`p-4 gap-3 ${Platform.OS === 'android' ? 'pb-20' : ''}`}>
              {collections.map((item) => (
                <SoalSet
                  key={item.id}
                  set={item}
                  onPress={() => router.push({ pathname: '/soal/practice/[id]', params: { id: String(item.id) } })}
                />
              ))}
              {collections.length > 0 && (
                <View className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Text className="text-sm text-muted-foreground text-center mb-3">
                    kalo mau cari soal lebih, cek website dan gabung ke kelas
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={handleWebsitePress}
                    className="w-full flex-row gap-2"
                  >
                    <Icon as={Search} size={16} className="text-foreground" />
                    <Text className="text-sm">Cari Soal</Text>
                  </Button>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
