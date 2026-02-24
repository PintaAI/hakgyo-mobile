import React, { useEffect, useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { soalApi, type Soal } from 'hakgyo-expo-sdk';
import { Quiz, type QuizResult } from '@/components/soal/quiz';
import { QuizSkeleton } from '@/components/soal/quiz-skeleton';

interface CollectionData {
  id: number;
  title?: string;
  nama?: string;
  judul?: string;
  description?: string;
  deskripsi?: string;
}

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [soals, setSoals] = useState<Soal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    fetchSoalData();
  }, [id]);

  const fetchSoalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch collection details
      const collectionResponse = await soalApi.getCollection(Number(id));
      console.log('[Practice] getCollection response:', collectionResponse);
      if (collectionResponse.success && collectionResponse.data) {
        setCollection(collectionResponse.data as CollectionData);
      }

      // Fetch questions
      const questionsResponse = await soalApi.listQuestions({
        koleksiSoalId: String(id),
        limit: 100,
        offset: 0,
      });
      console.log('[Practice] listQuestions response:', JSON.stringify(questionsResponse, null, 2));
      if (questionsResponse.success && questionsResponse.data?.data) {
        setSoals(questionsResponse.data.data);
      }
    } catch (err) {
      console.error('[Practice] Error fetching practice data:', err);
      setError('Gagal memuat data latihan');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, answerIndex: number, isCorrect: boolean) => {
    setTotalAnswered((prev) => prev + 1);
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleQuizComplete = (results: QuizResult[]) => {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / results.length) * 100);
    let message = `Skor Anda: ${score}% (${correctCount}/${results.length} benar)`;

    // Add encouragement based on score
    if (score === 100) {
      message += '\n\n🎉 Sempurna! Kerja bagus!';
    } else if (score >= 80) {
      message += '\n\nLuar biasa! Terus berlatih!';
    } else if (score >= 60) {
      message += '\n\nBagus! Coba lagi untuk hasil lebih baik.';
    } else {
      message += '\n\nJangan menyerah! Terus berlatih.';
    }

    Alert.alert(
      'Latihan Selesai!',
      message,
      [
        {
          text: 'Ulangi',
          onPress: () => {
            setCorrectAnswers(0);
            setTotalAnswered(0);
          },
        },
        {
          text: 'Kembali',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleBack = () => {
    if (totalAnswered > 0) {
      Alert.alert(
        'Konfirmasi',
        'Apakah Anda yakin ingin kembali? Progress Anda akan hilang.',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Kembali',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Header skeleton component
  const HeaderSkeleton = () => (
    <View className="px-5 pt-4 pb-2 border-b border-border/50">
      <View className="flex-row items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-5 w-40 flex-1" />
        <Skeleton className="h-4 w-12" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1">
          {/* Header skeleton */}
          <HeaderSkeleton />

          {/* Content skeleton */}
          <ScrollView className="flex-1 px-5 py-4">
            <QuizSkeleton tryoutMode={false} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1 items-center justify-center px-6">
          <Icon as={AlertCircle} size={48} className="text-destructive mb-4" />
          <Text className="text-lg font-semibold mb-2">Terjadi Kesalahan</Text>
          <Text className="text-center text-muted-foreground mb-6">{error}</Text>
          <Button onPress={() => router.back()} variant="outline">
            <Text>Kembali</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (soals.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold mb-2">Tidak Ada Soal</Text>
          <Text className="text-center text-muted-foreground mb-6">Koleksi latihan ini kosong.</Text>
          <Button onPress={() => router.back()} variant="outline">
            <Text>Kembali</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Background />
      {/* Header with back button */}
      <View className="px-5 pt-4 pb-2 border-b border-border/50">
        <View className="flex-row items-center gap-3">
          <Button variant="ghost" size="icon" onPress={handleBack} className="w-8 h-8">
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </Button>
          <Text className="text-base font-semibold flex-1" numberOfLines={1}>
            {collection?.title || collection?.nama || collection?.judul || 'Latihan'}
          </Text>
          {totalAnswered > 0 && (
            <Text className="text-sm text-muted-foreground">
              {correctAnswers}/{totalAnswered}
            </Text>
          )}
        </View>
      </View>

      {/* Quiz content */}
      <ScrollView className="flex-1 px-5 py-4">
        <Quiz
          questions={soals}
          title={collection?.title || collection?.nama || collection?.judul || 'Latihan'}
          loading={false}
          onAnswer={handleAnswer}
          onQuizComplete={handleQuizComplete}
          loopOnComplete={false}
          showProgress={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
