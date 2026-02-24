import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, Star, ArrowRight } from 'lucide-react-native';
import { tryoutApi, type Tryout, type TryoutParticipant, type TryoutAnswer } from 'hakgyo-expo-sdk';

interface ResultData {
  score: number;
  correctCount: number;
  totalCount: number;
  timeTakenSeconds?: number;
  passed?: boolean;
  details?: any;
  gamification?: {
    quiz?: {
      totalXP: number;
    };
    perfectScore?: boolean;
  };
}

export default function TryoutResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [participant, setParticipant] = useState<TryoutParticipant | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [answers, setAnswers] = useState<TryoutAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tryout details
      const tryoutResponse = await tryoutApi.get(Number(id));
      if (tryoutResponse.success && tryoutResponse.data) {
        // FIX: SDK double-wraps - actual Tryout is at .data.data
        const rawTryout = tryoutResponse.data as any;
        const tryoutData = rawTryout?.data ?? rawTryout;
        setTryout(tryoutData);
      }

      // Fetch results
      const resultsResponse = await tryoutApi.getResults(Number(id));
      console.log('Results Response:', resultsResponse);

      if (resultsResponse.success && resultsResponse.data) {
        // FIX: SDK double-wraps - actual results data is at .data.data
        const rawResults = resultsResponse.data as any;
        const data = rawResults?.data ?? rawResults;

        // Check if data is an array (teacher view) or object (student view)
        if (Array.isArray(data)) {
          // For students, find their own result
          // This shouldn't happen for students, but handle gracefully
          setError('Tidak dapat menampilkan hasil');
        } else {
          // Student view - single result object
          setParticipant(data);

          // Extract result data
          const resultData: ResultData = {
            score: data.score ?? 0,
            correctCount: data.correctCount ?? 0,
            totalCount: data.tryout?.koleksiSoal?._count?.soals ?? data.tryout?.koleksiSoal?.soals?.length ?? 0,
            timeTakenSeconds: data.timeTakenSeconds,
            passed: data.score >= (data.tryout?.passingScore ?? 60),
            details: data.details,
            gamification: data.gamification,
          };
          setResult(resultData);

          // Extract answers if available
          if (data.answers) {
            setAnswers(data.answers);
          }
        }
      } else {
        setError('Gagal memuat hasil tryout');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Terjadi kesalahan saat memuat hasil');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score === 100) return 'Sempurna! 🎉';
    if (score >= 90) return 'Luar biasa! ⭐';
    if (score >= 80) return 'Bagus sekali! 👍';
    if (score >= 70) return 'Cukup baik! 👌';
    if (score >= 60) return 'Lulus! 📝';
    return 'Coba lagi! 💪';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1 items-center justify-center px-6">
          <Icon as={XCircle} size={48} className="text-destructive mb-4" />
          <Text className="text-lg font-semibold mb-2">Terjadi Kesalahan</Text>
          <Text className="text-center text-muted-foreground mb-6">{error}</Text>
          <Button onPress={() => router.back()} variant="outline">
            <Text>Kembali</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!result || !tryout) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold mb-2">Hasil Tidak Ditemukan</Text>
          <Text className="text-center text-muted-foreground mb-6">
            Belum ada hasil untuk tryout ini.
          </Text>
          <Button onPress={() => router.back()} variant="outline">
            <Text>Kembali</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const scorePercentage = result.score;
  const progressValue = scorePercentage / 100;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-3 border-b border-border/50">
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="icon" onPress={() => router.replace('/soal/tryout')} className="w-8 h-8">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Button>
            <View className="flex-1">
              <Text className="text-base font-semibold" numberOfLines={1}>
                Hasil Tryout
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {tryout.nama}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-5 py-4">
          {/* Score Card */}
          <Card className="mb-4 border-primary/30 bg-primary/5">
            <CardContent className="p-6 items-center">
              <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
                <Text className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage}
                </Text>
                <Text className="text-sm text-muted-foreground">%</Text>
              </View>
              <Text className="text-lg font-semibold mb-1">{getScoreMessage(scorePercentage)}</Text>
              <Text className="text-sm text-muted-foreground mb-4">
                {result.correctCount} / {result.totalCount} jawaban benar
              </Text>

              {/* Progress Bar */}
              <View className="w-full mb-4">
                <Progress value={progressValue} className="h-3" />
              </View>

              {/* Stats Row */}
              <View className="flex-row items-center justify-around w-full">
                <View className="items-center">
                  <View className="bg-green-500/20 px-3 py-1.5 rounded-full mb-1">
                    <Text className="text-sm font-semibold text-green-600">{result.correctCount}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">Benar</Text>
                </View>
                <View className="items-center">
                  <View className="bg-red-500/20 px-3 py-1.5 rounded-full mb-1">
                    <Text className="text-sm font-semibold text-red-600">
                      {result.totalCount - result.correctCount}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">Salah</Text>
                </View>
                <View className="items-center">
                  <View className="bg-blue-500/20 px-3 py-1.5 rounded-full mb-1 flex-row items-center gap-1">
                    <Icon as={Clock} size={12} className="text-blue-600" />
                    <Text className="text-sm font-semibold text-blue-600">
                      {formatTime(result.timeTakenSeconds)}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">Waktu</Text>
                </View>
              </View>

              {/* Passing Status */}
              {result.passed !== undefined && (
                <View className={`mt-4 px-4 py-2 rounded-full ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Text className={`text-sm font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.passed ? '✓ LULUS' : '✗ TIDAK LULUS'}
                    <Text className="text-xs font-normal ml-1">
                      (Batas: {tryout.passingScore}%)
                    </Text>
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Gamification Rewards */}
          {result.gamification && (
            <Card className="mb-4 border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <Icon as={Trophy} size={20} className="text-yellow-500" />
                  <Text className="text-base font-semibold">Hadiah XP</Text>
                </View>

                {result.gamification.quiz?.totalXP && result.gamification.quiz.totalXP > 0 && (
                  <View className="flex-row items-center justify-between py-2 border-b border-border/30">
                    <Text className="text-sm text-muted-foreground">Menyelesaikan Tryout</Text>
                    <Badge variant="secondary">
                      <Text className="text-sm font-semibold text-primary">+{result.gamification.quiz.totalXP} XP</Text>
                    </Badge>
                  </View>
                )}

                {result.gamification.perfectScore && (
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center gap-2">
                      <Icon as={Star} size={16} className="text-yellow-500" />
                      <Text className="text-sm font-medium">Bonus Skor Sempurna</Text>
                    </View>
                    <Badge variant="secondary">
                      <Text className="text-sm font-semibold text-primary">+30 XP</Text>
                    </Badge>
                  </View>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="gap-3 mb-6">
            {/* Only show "Ulangi Tryout" if maxAttempts > 1 and attemptCount < maxAttempts */}
            {participant &&
              participant.tryout?.maxAttempts &&
              participant.tryout.maxAttempts > 1 &&
              (participant.attemptCount ?? 0) < participant.tryout.maxAttempts && (
                <Button onPress={() => router.push({ pathname: '/soal/tryout/[id]', params: { id } })}>
                  <Text className="text-primary-foreground">Ulangi Tryout</Text>
                </Button>
              )}
            <Button
              variant="outline"
              onPress={() => router.replace('/soal/tryout')}
              className="flex-row items-center justify-center gap-2"
            >
              <Text>Lihat Tryout Lainnya</Text>
              <Icon as={ArrowRight} size={16} className="text-foreground" />
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
    </>
  );
}
