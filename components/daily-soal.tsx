import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react-native';
import { MOCK_SOAL, Soal } from '@/data/mock-soal';

export function DailySoal() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const question = MOCK_SOAL[currentQuestion];

  const handleAnswer = (opsiId: string) => {
    setSelectedAnswer(opsiId);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < MOCK_SOAL.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Reset to first question
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const selectedOpsi = question.opsi.find((o) => o.id === selectedAnswer);
  const isCorrect = selectedOpsi?.isCorrect ?? false;
  const correctOpsi = question.opsi.find((o) => o.isCorrect);

  return (
    <Card className="border-primary/20">
      <CardContent>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">Latihan Harian</Text>
          <Badge variant="secondary">
            <Text>{currentQuestion + 1}/{MOCK_SOAL.length}</Text>
          </Badge>
        </View>

        <View className="mb-4">
          <Text className="text-base mb-1">{question.pertanyaan}</Text>
        </View>

        <View className="gap-2 mb-4">
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
              onPress={() => !showResult && handleAnswer(opsi.id)}
              className="justify-start"
              disabled={showResult}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-xs font-bold">{opsi.id}</Text>
                </View>
                <Text className="flex-1 text-left">{opsi.teks}</Text>
                {showResult && opsi.isCorrect && (
                  <Icon as={CheckCircle2} size={20} className="text-white" />
                )}
                {showResult && opsi.id === selectedAnswer && !opsi.isCorrect && (
                  <Icon as={XCircle} size={20} className="text-white" />
                )}
              </View>
            </Button>
          ))}
        </View>

        {showResult && (
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <Icon
                as={isCorrect ? CheckCircle2 : XCircle}
                size={20}
                className={isCorrect ? 'text-green-500' : 'text-red-500'}
              />
              <Text className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                {isCorrect ? 'Benar!' : 'Salah!'}
              </Text>
            </View>
            <Button size="sm" onPress={handleNext}>
              <Text className="text-primary-foreground">
                {currentQuestion === MOCK_SOAL.length - 1 ? 'Ulangi' : 'Lanjut'}
              </Text>
              <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
            </Button>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
