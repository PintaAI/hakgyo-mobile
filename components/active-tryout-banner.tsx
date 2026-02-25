import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { AlertCircle } from 'lucide-react-native';
import { tryoutApi, type Tryout } from 'hakgyo-expo-sdk';

export function ActiveTryoutBanner() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [activeTryouts, setActiveTryouts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveTryouts = async () => {
      try {
        console.log('[ActiveTryoutBanner] Fetching active tryouts...');
        const response = await tryoutApi.listActive();
        console.log('[ActiveTryoutBanner] Response:', response);
        if (response.success && response.data) {
          const rawData = response.data as any;
          const tryoutData: Tryout[] = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.data)
            ? rawData.data
            : [];
          console.log('[ActiveTryoutBanner] Parsed tryoutData:', tryoutData);

          // Filter out tryouts that have ended
          const now = new Date();
          const activeTryoutsFiltered = tryoutData.filter((tryout) => {
            const endTime = new Date(tryout.endTime);
            const isStillActive = endTime > now;
            console.log(`[ActiveTryoutBanner] Tryout ${tryout.id} (${tryout.nama}): endTime=${tryout.endTime}, isStillActive=${isStillActive}`);
            return isStillActive;
          });

          console.log('[ActiveTryoutBanner] Active tryouts after time filter:', activeTryoutsFiltered.length);
          setActiveTryouts(activeTryoutsFiltered.length);
        } else {
          console.log('[ActiveTryoutBanner] No active tryouts found');
        }
      } catch (error) {
        console.error('[ActiveTryoutBanner] Error fetching active tryouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTryouts();
  }, []);

  console.log('[ActiveTryoutBanner] Render - loading:', loading, 'activeTryouts:', activeTryouts);
  if (loading || activeTryouts === 0) {
    console.log('[ActiveTryoutBanner] Hiding banner');
    return null;
  }
  console.log('[ActiveTryoutBanner] Showing banner');

  return (
    <View className="rounded-xl overflow-hidden">
      <LinearGradient
        colors={GRADIENTS[colorScheme ?? 'light'].soalChip}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Button
          variant="ghost"
          onPress={() => router.push('/soal/tryout/')}
          className="w-full justify-start h-auto py-3 px-4"
        >
          <View className="flex-row items-center gap-3">
            <Icon as={AlertCircle} size={20} className="text-foreground" />
            <Text className="text-base font-semibold text-foreground">
              Ada jadwal tryout aktif cek di sini
            </Text>
          </View>
        </Button>
      </LinearGradient>
    </View>
  );
}
