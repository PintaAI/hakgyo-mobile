import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, CalendarX } from 'lucide-react-native';
import { tryoutApi, soalApi, type Tryout, type TryoutParticipant, type Soal, type Opsi } from 'hakgyo-expo-sdk';
import { Quiz, type QuizResult } from '@/components/soal/quiz';
import { QuizSkeleton } from '@/components/soal/quiz-skeleton';

interface Answer {
  soalId: number;
  opsiId: number;
}

export default function TryoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [soals, setSoals] = useState<Soal[]>([]);
  const [participant, setParticipant] = useState<TryoutParticipant | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tryoutEnded, setTryoutEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    fetchSoalData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  const startTimer = (durationMinutes: number) => {
    // Count down from durationMinutes (e.g. 30 → starts at 30:00 in MM:SS)
    const totalSeconds = durationMinutes * 60;
    const startedAt = Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const seconds = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(seconds);

      if (seconds <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current as NodeJS.Timeout);
        }
        handleSubmitTryout();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000) as unknown as NodeJS.Timeout;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchSoalData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Tryout] Fetching details for id:', id);
      const parsedId = Number(id);
      console.log('[Tryout] Parsed id:', parsedId, 'isNaN:', isNaN(parsedId));

      // Fetch tryout details
      const tryoutResponse = await tryoutApi.get(parsedId);
      console.log('[Tryout] API Response:', JSON.stringify(tryoutResponse, null, 2));

      if (tryoutResponse.success && tryoutResponse.data) {
        // FIX: SDK double-wraps as response - actual Tryout data is at .data.data
        const rawTryoutData = tryoutResponse.data as any;
        const tryoutData: Tryout = rawTryoutData?.data ?? rawTryoutData;
        console.log('[Tryout] Resolved tryout data:', tryoutData);
        console.log('[Tryout] koleksiSoalId:', tryoutData.koleksiSoalId);
        console.log('[Tryout] Embedded soals count:', tryoutData.koleksiSoal?.soals?.length ?? 0);

        setTryout(tryoutData);

        // FIX: Use embedded soals from tryout response directly.
        // The backend already eagerly loads koleksiSoal.soals in GET /api/tryout/[id],
        // so no separate API call is needed. This avoids the broken koleksiSoalId filter.
        if (tryoutData.koleksiSoal?.soals && tryoutData.koleksiSoal.soals.length > 0) {
          setSoals(tryoutData.koleksiSoal.soals);
        } else if (tryoutData.koleksiSoalId) {
          // Fallback: fetch separately only if embedded soals are missing
          const questionsResponse = await soalApi.listQuestions({
            koleksiSoalId: String(tryoutData.koleksiSoalId),
            limit: 100,
            offset: 0,
          });
          console.log('[Tryout] listQuestions response:', JSON.stringify(questionsResponse, null, 2));
          if (questionsResponse.success && questionsResponse.data?.data) {
            setSoals(questionsResponse.data.data);
          }
        }

        // FIX: Use tryoutData.duration (minutes) to count down as student's personal time
        if (tryoutData.duration) {
          startTimer(tryoutData.duration);
        }
      }

      // Participate in tryout
      const participantResponse = await tryoutApi.participate(Number(id));
      console.log('[Tryout] Participate response:', JSON.stringify(participantResponse, null, 2));
      if (participantResponse.success && participantResponse.data) {
        // FIX: SDK double-wraps as response - actual participant is at .data.data
        const rawParticipant = participantResponse.data as any;
        const participantData = rawParticipant?.data ?? rawParticipant;
        console.log('[Tryout] Resolved participant data:', participantData);
        setParticipant(participantData);

        // Check if participant already submitted - navigate directly to results
        if (participantData.status === 'SUBMITTED') {
          console.log('[Tryout] Participant already submitted, navigating to results');
          router.push(`/soal/tryout/${id}/result`);
          return;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Check if the error is specifically "Tryout has ended"
      if (errorMessage.includes('Tryout has ended')) {
        // This is an expected scenario - log as info since it's handled gracefully
        console.info('[Tryout] Tryout has ended - showing ended state to user');
        setTryoutEnded(true);
        setError('Tryout telah berakhir');
      } else {
        // This is an unexpected error - log as error
        console.error('[Tryout] Error fetching tryout data:', err);
        setError('Gagal memuat data tryout');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, answerIndex: number, isCorrect: boolean) => {
    setQuizResults((prev) => [
      ...prev,
      { questionIndex, questionId: soals[questionIndex].id, selectedAnswerIndex: answerIndex, isCorrect }
    ]);
  };

  const handleQuizComplete = async (results: QuizResult[]) => {
    console.log('[Tryout] Quiz complete with results:', results);
    
    try {
      // Convert QuizResult (selectedAnswerIndex) → { soalId, opsiId } format required by API
      const answers = results
        .filter((r) => soals[r.questionIndex]?.opsis[r.selectedAnswerIndex])
        .map((r) => ({
          soalId: soals[r.questionIndex].id,
          opsiId: soals[r.questionIndex].opsis[r.selectedAnswerIndex].id,
        }));

      console.log('[Tryout] Submitting answers:', JSON.stringify(answers, null, 2));

      const submitResponse = await tryoutApi.submit(Number(id), answers);
      console.log('[Tryout] Submit response:', JSON.stringify(submitResponse, null, 2));

      if (!submitResponse.success) {
        Alert.alert('Error', 'Gagal mengumpulkan jawaban. Silakan coba lagi.');
        return;
      }
    } catch (err) {
      console.error('[Tryout] Error submitting answers:', err);
      Alert.alert('Error', 'Gagal mengumpulkan jawaban');
      return;
    }

    // Navigate to results screen after successful submission
    router.push(`/soal/tryout/${id}/result`);
  };

  const handleSubmitTryout = () => {
    // Submit all answers, including unanswered questions
    handleQuizComplete(quizResults);
  };

  const handleBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    router.back();
  };

  // Header skeleton component
  const HeaderSkeleton = () => (
    <View className="px-5 pt-4 pb-3 border-b border-border/50">
      <View className="flex-row items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <View className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </View>
        <Skeleton className="h-7 w-16 rounded-full" />
      </View>
    </View>
  );

  if (tryoutEnded) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1 items-center justify-center px-6">
          <Icon as={CalendarX} size={64} className="text-muted-foreground mb-4" />
          <Text className="text-xl font-bold mb-2">Tryout Telah Berakhir</Text>
          <Text className="text-center text-muted-foreground mb-6">
            Maaf, tryout ini sudah tidak tersedia lagi. Silakan coba tryout lain yang masih aktif.
          </Text>
          <Button onPress={() => router.back()} variant="default" className="w-full">
            <Text>Kembali ke Daftar Tryout</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Background />
        <View className="flex-1">
          {/* Header skeleton */}
          <HeaderSkeleton />

          {/* Progress bar skeleton */}
          <View className="h-1 bg-border/50">
            <Skeleton className="h-full w-1/3" />
          </View>

          {/* Content skeleton */}
          <ScrollView className="flex-1 px-5 py-4">
            <QuizSkeleton tryoutMode={true} />
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
          <Text className="text-center text-muted-foreground mb-6">Koleksi tryout ini kosong.</Text>
          <Button onPress={() => router.back()} variant="outline">
            <Text>Kembali</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentSoal = soals[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / soals.length) * 100;
  const isAnswered = quizResults.some((r) => r.questionIndex === currentQuestionIndex);
  const timeColor = timeLeft < 300 ? 'text-destructive' : 'text-primary';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Background />
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-3 border-b border-border/50">
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="icon" onPress={handleBack} className="w-8 h-8">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Button>
            <View className="flex-1">
              <Text className="text-base font-semibold" numberOfLines={1}>
                {tryout?.nama || 'Tryout'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Soal {currentQuestionIndex + 1} dari {soals.length}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
              <Icon as={Clock} size={14} className={timeColor} />
              <Text className={`text-xs font-medium ${timeColor}`}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-1 bg-border/50">
          <View className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-5 py-4">
          <Quiz
            questions={soals}
            title={tryout?.nama || 'Tryout'}
            loading={false}
            onAnswer={handleAnswer}
            onQuizComplete={handleQuizComplete}
            onQuestionChange={setCurrentQuestionIndex}
            loopOnComplete={false}
            showProgress={true}
            tryoutMode={true}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
