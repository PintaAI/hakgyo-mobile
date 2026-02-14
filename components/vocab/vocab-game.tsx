import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Check, X, RotateCcw } from 'lucide-react-native';
import { VocabularyItem } from '@/data/mock-vocabulary';
import { VocabGameCard } from './vocab-game-card';

interface VocabGameProps {
  vocabulary: VocabularyItem[];
}

export function VocabGame({ vocabulary }: VocabGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentVocab = vocabulary[currentIndex];

  const handleAnswer = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    setShowAnswer(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      setScore(0);
    }
    setShowAnswer(false);
    setAnswered(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowAnswer(false);
    setAnswered(false);
  };

  return (
    <View className="p-4 gap-4">
      {/* Score */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-muted-foreground">Skor</Text>
            <Text className="text-2xl font-bold">{score}/{vocabulary.length}</Text>
          </View>
          <Button variant="outline" size="sm" onPress={handleRestart}>
            <Icon as={RotateCcw} size={16} className="text-foreground" />
            <Text className="text-foreground">Ulangi</Text>
          </Button>
        </CardContent>
      </Card>

      {/* Progress */}
      <View className="flex-row gap-1">
        {vocabulary.map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-1 rounded-full ${
              index < currentIndex ? 'bg-primary' :
              index === currentIndex ? 'bg-primary/50' :
              'bg-muted'
            }`}
          />
        ))}
      </View>

      {/* Flashcard */}
      <VocabGameCard vocab={currentVocab} showAnswer={showAnswer} />

      {/* Actions */}
      {!showAnswer ? (
        <Button onPress={() => setShowAnswer(true)} className="w-full">
          <Text className="text-primary-foreground">Lihat Jawaban</Text>
        </Button>
      ) : (
        <View className="gap-2">
          <Button
            variant="destructive"
            onPress={() => handleAnswer(false)}
            disabled={answered}
            className="w-full"
          >
            <Icon as={X} size={20} className="text-white" />
            <Text className="text-white">Belum Hafal</Text>
          </Button>
          <Button
            onPress={() => handleAnswer(true)}
            disabled={answered}
            className="w-full"
          >
            <Icon as={Check} size={20} className="text-primary-foreground" />
            <Text className="text-primary-foreground">Sudah Hafal</Text>
          </Button>
          <Button variant="outline" onPress={handleNext} className="w-full">
            <Text className="text-foreground">Lanjut</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
