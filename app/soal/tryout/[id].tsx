import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { tryoutApi, soalApi, type Tryout, type TryoutParticipant, type Soal, type Opsi } from 'hakgyo-expo-sdk';

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
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSoalData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  const startTimer = (endTime: string) => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();
      const seconds = Math.max(0, Math.floor(diff / 1000));
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

      // Fetch tryout details
      const tryoutResponse = await tryoutApi.get(Number(id));
      if (tryoutResponse.success && tryoutResponse.data) {
        setTryout(tryoutResponse.data);
        
        // Fetch questions separately using soalApi
        const questionsResponse = await soalApi.listQuestions({
          koleksiSoalId: String(tryoutResponse.data.koleksiSoalId),
          limit: 100,
          offset: 0,
        });
        if (questionsResponse.success && questionsResponse.data?.data) {
          setSoals(questionsResponse.data.data);
        }
      }

      // Participate in tryout
      const participantResponse = await tryoutApi.participate(Number(id));
      if (participantResponse.success && participantResponse.data) {
        setParticipant(participantResponse.data);
      }

      // Start timer based on tryout endTime
      if (tryoutResponse.data?.endTime) {
        startTimer(tryoutResponse.data.endTime);
      }
    } catch (err) {
      console.error('Error fetching tryout data:', err);
      setError('Gagal memuat data tryout');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswer(answerId);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const currentSoal = soals[currentQuestionIndex];
      const newAnswers = [...answers];
      const existingIndex = newAnswers.findIndex((a) => a.soalId === currentSoal.id);
      
      if (existingIndex >= 0) {
        newAnswers[existingIndex] = { soalId: currentSoal.id, opsiId: selectedAnswer };
      } else {
        newAnswers.push({ soalId: currentSoal.id, opsiId: selectedAnswer });
      }
      setAnswers(newAnswers);
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    }

    if (currentQuestionIndex < soals.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestion = soals[currentQuestionIndex - 1];
      const existingAnswer = answers.find((a) => a.soalId === prevQuestion.id);
      setSelectedAnswer(existingAnswer?.opsiId || null);
    }
  };

  const handleSubmitTryout = () => {
    if (answeredQuestions.size < soals.length) {
      Alert.alert(
        'Konfirmasi',
        `Anda baru menjawab ${answeredQuestions.size} dari ${soals.length} soal. Yakin ingin mengumpulkan?`,
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Kumpulkan',
            onPress: async () => {
              await submitAnswers();
            },
          },
        ]
      );
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    try {
      const result = await tryoutApi.submit(Number(id), answers);
      if (result.success && result.data) {
        const resultData = result.data as any;
        const score = resultData.score ?? 0;
        const correctCount = resultData.correctCount ?? 0;
        const totalCount = resultData.totalCount ?? resultData.totalQuestions ?? soals.length;
        let message = `Skor Anda: ${score}% (${correctCount}/${totalCount} benar)`;
        
        if (resultData.gamification) {
          const quizXP = resultData.gamification.quiz?.totalXP || 0;
          if (quizXP > 0) {
            message += `\n\nXP yang didapat: +${quizXP}`;
          }
          if (resultData.gamification.perfectScore) {
            message += '\n\n🎉 Skor Sempurna! Bonus +30 XP';
          }
        }

        Alert.alert(
          'Tryout Selesai!',
          message,
          [
            {
              text: 'Lihat Detail',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      Alert.alert('Error', 'Gagal mengumpulkan jawaban');
    }
  };

  const handleBack = () => {
    if (answeredQuestions.size > 0) {
      Alert.alert(
        'Konfirmasi',
        'Apakah Anda yakin ingin keluar? Progress Anda akan hilang.',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Keluar',
            style: 'destructive',
            onPress: () => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              router.back();
            },
          },
        ]
      );
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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
  const isAnswered = answeredQuestions.has(currentQuestionIndex);
  const timeColor = timeLeft < 300 ? 'text-destructive' : 'text-primary';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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
          <Card>
            <CardContent className="p-4 gap-4">
              {/* Question */}
              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Pertanyaan {currentQuestionIndex + 1}
                </Text>
                <Text className="text-base leading-relaxed">{currentSoal.pertanyaan}</Text>
              </View>

              {/* Options */}
              <View className="gap-2">
                {currentSoal.opsis.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const isPreviouslyAnswered = answers.some(
                    (a) => a.soalId === currentSoal.id && a.opsiId === option.id
                  );

                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      onPress={() => handleAnswerSelect(option.id)}
                      className={`
                        justify-start h-auto py-3 px-4 border-2
                        ${isSelected ? 'border-primary bg-primary/5' : ''}
                        ${isPreviouslyAnswered && !isSelected ? 'border-muted-foreground/30 bg-muted/20' : ''}
                      `}
                    >
                      <View className="flex-row items-start gap-3 flex-1">
                        <View
                          className={`
                            w-6 h-6 rounded-full items-center justify-center border
                            ${isSelected ? 'border-primary bg-primary' : 'border-border'}
                            ${isPreviouslyAnswered && !isSelected ? 'border-muted-foreground/30' : ''}
                          `}
                        >
                          {isSelected || isPreviouslyAnswered ? (
                            <Icon
                              as={CheckCircle}
                              size={14}
                              className={isSelected ? 'text-white' : 'text-muted-foreground'}
                            />
                          ) : (
                            <Text className="text-xs font-medium">{option.order + 1}</Text>
                          )}
                        </View>
                        <Text className="flex-1 text-sm leading-relaxed">{option.opsiText}</Text>
                      </View>
                    </Button>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-border/50 bg-background">
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              <Text>Sebelumnya</Text>
            </Button>
            {currentQuestionIndex === soals.length - 1 ? (
              <Button onPress={handleSubmitTryout} className="flex-1">
                <Text>Kumpulkan</Text>
              </Button>
            ) : (
              <Button onPress={handleNextQuestion} className="flex-1">
                <Text>Selanjutnya</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
