import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { HelpCircle, CheckCircle2, Trophy, ArrowRight } from 'lucide-react-native';
import {
  MOCK_KOLEKSI_SOAL,
  MOCK_SOAL,
  MOCK_PRACTICE_RESULTS,
  Soal,
  KoleksiSoal,
  mapDifficultyToOld,
} from '@/data/mock-soal';

type Tab = 'list' | 'practice';

export default function SoalScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [selectedSet, setSelectedSet] = useState<KoleksiSoal | null>(null);

  const handleStartPractice = (koleksiSoal: KoleksiSoal) => {
    setSelectedSet(koleksiSoal);
    setActiveTab('practice');
  };

  const handleBackToList = () => {
    setSelectedSet(null);
    setActiveTab('list');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-semibold">Latihan Soal</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {MOCK_KOLEKSI_SOAL.length} set latihan tersedia
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1">
          {activeTab === 'list' ? (
            <SoalList onStartPractice={handleStartPractice} />
          ) : (
            selectedSet && (
              <SoalPractice koleksiSoal={selectedSet} onBack={handleBackToList} />
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

interface SoalListProps {
  onStartPractice: (koleksiSoal: KoleksiSoal) => void;
}

function SoalList({ onStartPractice }: SoalListProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EPS_TOPIK':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'READING':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'LISTENING':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'GRAMMAR':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'INTERMEDIATE':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'ADVANCED':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <View className="p-4 gap-3">
      {MOCK_KOLEKSI_SOAL.map((set) => {
        const result = MOCK_PRACTICE_RESULTS.find((r) => r.sessionId === `session-${set.id}`);
        const completed = !!result;

        return (
          <Card key={set.id} className="border-primary/20">
            <CardContent>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-lg font-bold">{set.judul}</Text>
                    {completed && (
                      <Icon as={CheckCircle2} size={20} className="text-green-500" />
                    )}
                  </View>
                  <Text className="text-sm text-muted-foreground mb-2">
                    {set.deskripsi}
                  </Text>
                  <View className="flex-row gap-2 flex-wrap">
                    <Badge className={getCategoryColor(set.kategori)}>
                      <Text>{set.kategori.replace(/_/g, ' ')}</Text>
                    </Badge>
                    <Badge className={getDifficultyColor(set.tingkatKesulitan)}>
                      <Text>{mapDifficultyToOld(set.tingkatKesulitan)}</Text>
                    </Badge>
                    <Badge variant="outline">
                      <Text>{set.jumlahSoal} Soal</Text>
                    </Badge>
                  </View>
                </View>
              </View>

              {completed && result && (
                <View className="flex-row items-center gap-2 mb-3 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <Icon as={Trophy} size={16} className="text-yellow-500" />
                  <Text className="text-sm text-green-700 dark:text-green-300">
                    Skor terakhir: {result.skor}%
                  </Text>
                </View>
              )}

              <Button
                onPress={() => onStartPractice(set)}
                className="w-full"
                variant={completed ? 'outline' : 'default'}
              >
                <Text className={completed ? 'text-foreground' : 'text-primary-foreground'}>
                  {completed ? 'Ulangi Latihan' : 'Mulai Latihan'}
                </Text>
                <Icon
                  as={ArrowRight}
                  size={16}
                  className={completed ? 'text-foreground' : 'text-primary-foreground'}
                />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </View>
  );
}

interface SoalPracticeProps {
  koleksiSoal: KoleksiSoal;
  onBack: () => void;
}

function SoalPractice({ koleksiSoal, onBack }: SoalPracticeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = MOCK_SOAL.slice(0, koleksiSoal.jumlahSoal);
  const question = questions[currentQuestion];

  const handleAnswer = (opsiId: string) => {
    if (showResult) return;
    setSelectedAnswer(opsiId);
    setShowResult(true);
    const selectedOpsi = question.opsi.find((o) => o.id === opsiId);
    if (selectedOpsi?.isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const finalScore = Math.round((score / questions.length) * 100);
    return (
      <View className="p-4 gap-4">
        <Button variant="outline" onPress={onBack} className="w-full">
          <Text className="text-foreground">Kembali ke Daftar</Text>
        </Button>

        <Card className="border-primary/20">
          <CardContent className="items-center gap-4">
            <View className="h-20 w-20 rounded-full bg-primary/20 items-center justify-center">
              <Icon as={Trophy} size={40} className="text-primary" />
            </View>
            <Text className="text-2xl font-bold">Latihan Selesai!</Text>
            <Text className="text-4xl font-bold text-primary">{finalScore}%</Text>
            <Text className="text-muted-foreground">
              Anda benar {score} dari {questions.length} soal
            </Text>
            <Button onPress={handleRestart} className="w-full">
              <Text className="text-primary-foreground">Ulangi Latihan</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  const selectedOpsi = question.opsi.find((o) => o.id === selectedAnswer);
  const isCorrect = selectedOpsi?.isCorrect ?? false;

  return (
    <View className="p-4 gap-4">
      {/* Header */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-muted-foreground">{koleksiSoal.judul}</Text>
              <Text className="text-lg font-bold">
                Soal {currentQuestion + 1} dari {questions.length}
              </Text>
            </View>
            <Badge variant="secondary">
              <Text>Skor: {score}</Text>
            </Badge>
          </View>
        </CardContent>
      </Card>

      {/* Progress */}
      <View className="flex-row gap-1">
        {questions.map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-2 rounded-full ${
              index < currentQuestion ? 'bg-primary' :
              index === currentQuestion ? 'bg-primary/50' :
              'bg-muted'
            }`}
          />
        ))}
      </View>

      {/* Question */}
      <Card className="border-primary/20">
        <CardContent>
          <View className="mb-4">
            <Text className="text-lg font-bold mb-2">{question.pertanyaan}</Text>
          </View>

          <View className="gap-2">
            {question.opsi.map((opsi) => (
              <Button
                key={opsi.id}
                variant={
                  showResult
                    ? opsi.isCorrect
                      ? 'default'
                      : opsi.id === selectedAnswer
                      ? 'destructive'
                      : 'outline'
                    : selectedAnswer === opsi.id
                    ? 'default'
                    : 'outline'
                }
                onPress={() => handleAnswer(opsi.id)}
                className="justify-start"
                disabled={showResult}
              >
                <View className="flex-row items-center gap-3 w-full">
                  <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                    <Text className="text-sm font-bold">{opsi.id}</Text>
                  </View>
                  <Text className="flex-1 text-left">{opsi.teks}</Text>
                  {showResult && opsi.isCorrect && (
                    <Icon as={CheckCircle2} size={20} className="text-white" />
                  )}
                </View>
              </Button>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* Result & Next */}
      {showResult && (
        <Card className={isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}>
          <CardContent>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon
                  as={isCorrect ? CheckCircle2 : HelpCircle}
                  size={24}
                  className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                />
                <Text className={isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {isCorrect ? 'Benar!' : 'Salah!'}
                </Text>
              </View>
              <Button size="sm" onPress={handleNext}>
                <Text className="text-primary-foreground">
                  {currentQuestion === questions.length - 1 ? 'Selesai' : 'Lanjut'}
                </Text>
                <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
              </Button>
            </View>
          </CardContent>
        </Card>
      )}
    </View>
  );
}
