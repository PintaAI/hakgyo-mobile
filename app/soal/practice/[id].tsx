import React, { useEffect, useState } from 'react';
import { View, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, Trophy, Star, Zap, RotateCcw, Eye, CheckCircle2 } from 'lucide-react-native';
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
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showBackConfirmDialog, setShowBackConfirmDialog] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

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
    let message = `Skor: ${score}% (${correctCount}/${results.length} benar)`;

    setQuizResults(results);
    setCompletionMessage(message);
    setShowCompletionDialog(true);
  };

  const handleRetry = () => {
    setCorrectAnswers(0);
    setTotalAnswered(0);
    setQuizResults([]);
    setIsReviewMode(false);
    setShowCompletionDialog(false);
  };

  const handleReview = () => {
    setIsReviewMode(true);
    setShowCompletionDialog(false);
  };

  const handleExitReview = () => {
    setIsReviewMode(false);
  };

  const handleBack = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else if (totalAnswered > 0) {
      setShowBackConfirmDialog(true);
    } else {
      router.back();
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmDialog(false);
    router.back();
  };

  const handleCancelBack = () => {
    setShowBackConfirmDialog(false);
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
          externalReviewMode={isReviewMode}
          initialResults={quizResults}
          onExitReview={handleExitReview}
        />
      </ScrollView>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionDialog(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md overflow-hidden">
           
            <View className="bg-primary/20 p-6 items-center">
              <View className="w-20 h-20 bg-white/20 rounded-full border  items-center justify-center mb-3">
                <Icon as={Trophy} size={40} className="text-primary" />
              </View>
              <CardTitle className="text-2xl text-foreground text-center">Latihan Selesai!</CardTitle>
              <CardDescription className="text-foreground/80 text-base text-center mt-1">
                {completionMessage}
              </CardDescription>
            </View>

            <CardContent className="p-2">
              {/* Stats row */}
              <View className="flex-row justify-around mb-6">
                <View className="items-center">
                  <View className="w-14 h-14 bg-green-500/10 rounded-full items-center justify-center mb-2">
                    <Icon as={CheckCircle2} size={28} className="text-green-500" />
                  </View>
                  <Text className="text-2xl font-bold text-green-500">
                    {quizResults.filter((r) => r.isCorrect).length}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Benar</Text>
                </View>
                <View className="items-center">
                  <View className="w-14 h-14 bg-red-500/10 rounded-full items-center justify-center mb-2">
                    <Icon as={AlertCircle} size={28} className="text-red-500" />
                  </View>
                  <Text className="text-2xl font-bold text-red-500">
                    {quizResults.filter((r) => !r.isCorrect).length}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Salah</Text>
                </View>
              </View>

              {/* XP Earned */}
              <View className="bg-primary/5 rounded-xl p-4 flex-row items-center gap-3 mb-4">
                <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                  <Icon as={Zap} size={20} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">XP Diperoleh</Text>
                  <Text className="text-xs text-muted-foreground">Terus belajar untuk level up!</Text>
                </View>
                <Text className="text-xl font-bold text-primary">
                  +{quizResults.filter((r) => r.isCorrect).length * 10}
                </Text>
              </View>

              {/* Performance rating */}
              <View className="flex-row items-center justify-center gap-1">
                {[1, 2, 3].map((star) => {
                  const scorePercent = Math.round(
                    (quizResults.filter((r) => r.isCorrect).length / quizResults.length) * 100
                  );
                  const filled = scorePercent >= star * 33;
                  return (
                    <Icon
                      key={star}
                      as={Star}
                      size={24}
                      className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  );
                })}
              </View>
            </CardContent>

            <CardFooter className="flex-col gap-3 p-6 pt-0">
              <View className="flex-row gap-3 w-full">
                <Button
                  onPress={handleReview}
                  className="flex-1 bg-primary h-12"
                >
                  <Icon as={Eye} size={20} className="text-primary-foreground mr-2" />
                  <Text className="text-primary-foreground font-semibold">Review</Text>
                </Button>
                <Button
                  onPress={handleRetry}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <Icon as={RotateCcw} size={20} className="text-foreground mr-2" />
                  <Text className="text-foreground font-semibold">Ulangi</Text>
                </Button>
              </View>
              <Button
                onPress={() => setShowCompletionDialog(false)}
                variant="destructive"
                className="w-full h-12"
              >
                <Text className="font-medium">Tutup</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>
      </Modal>

      {/* Back Confirmation Modal */}
      <Modal
        visible={showBackConfirmDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBackConfirmDialog(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Konfirmasi</CardTitle>
              <CardDescription className="text-base">
                Apakah Anda yakin ingin kembali? Progress Anda akan hilang.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-row justify-end gap-3">
              <Button variant="outline" onPress={handleCancelBack}>
                <Text>Batal</Text>
              </Button>
              <Button onPress={handleConfirmBack} className="bg-destructive">
                <Text>Kembali</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
