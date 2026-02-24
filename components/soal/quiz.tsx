import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react-native';
import { HtmlRenderer } from '@/lib/html-renderer';
import type { Soal, Opsi } from 'hakgyo-expo-sdk';

export interface QuizProps {
  questions: Soal[];
  title?: string;
  loading?: boolean;
  onAnswer?: (questionIndex: number, answerIndex: number, isCorrect: boolean) => void;
  onQuizComplete?: (results: QuizResult[]) => void;
  onQuestionChange?: (questionIndex: number) => void;
  loopOnComplete?: boolean;
  showProgress?: boolean;
  tryoutMode?: boolean; // Tryout mode: enables timer, progress bar, submit button
  className?: string;
}

export interface QuizResult {
  questionIndex: number;
  questionId: number;
  selectedAnswerIndex: number;
  isCorrect: boolean;
}

export function Quiz({
  questions,
  title = 'Latihan',
  loading = false,
  onAnswer,
  onQuizComplete,
  onQuestionChange,
  loopOnComplete = true,
  showProgress = true,
  tryoutMode = false,
  className = '',
}: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (questions.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <View className="items-center justify-center py-8">
            <Text className="text-muted-foreground text-center">
              Belum ada soal tersedia.
            </Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    const selectedOpsi = question.opsis[index];
    const isCorrect = selectedOpsi?.isCorrect ?? false;

    setSelectedAnswerIndex(index);
    setShowResult(true);

    // Record result
    const newResult: QuizResult = {
      questionIndex: currentQuestion,
      questionId: question.id,
      selectedAnswerIndex: index,
      isCorrect,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    console.log('[Quiz] Answer submitted:', {
      questionIndex: currentQuestion,
      questionId: question.id,
      selectedOption: selectedOpsi?.opsiText,
      isCorrect,
    });

    // Callbacks
    onAnswer?.(currentQuestion, index, isCorrect);

    // Check if quiz is complete
    if (currentQuestion === questions.length - 1) {
      console.log('[Quiz] Quiz complete. Results:', updatedResults);
      onQuizComplete?.(updatedResults);
    }
  };

  // Tryout mode: handle answer change (allows changing selection before next)
  const handleTryoutAnswerChange = (index: number) => {
    setSelectedAnswerIndex(index);
  };

  const handleNext = () => {
    // In tryout mode, record the answer and call onAnswer before moving
    if (tryoutMode && selectedAnswerIndex !== null) {
      const selectedOpsi = question.opsis[selectedAnswerIndex];
      const isCorrect = selectedOpsi?.isCorrect ?? false;
      const newResult = {
        questionIndex: currentQuestion,
        questionId: question.id,
        selectedAnswerIndex,
        isCorrect,
      };
      const updatedResults = [...results, newResult];
      setResults(updatedResults);
      onAnswer?.(currentQuestion, selectedAnswerIndex, isCorrect);

      // If last question in tryout mode → submit
      if (currentQuestion === questions.length - 1) {
        console.log('[Quiz][Tryout] Kumpulkan pressed. Results:', updatedResults);
        onQuizComplete?.(updatedResults);
        return;
      }
    }

    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedAnswerIndex(null);
      setShowResult(false);
      onQuestionChange?.(nextIndex);
    } else if (loopOnComplete) {
      // Reset to first question
      setCurrentQuestion(0);
      setSelectedAnswerIndex(null);
      setShowResult(false);
      setResults([]);
      onQuestionChange?.(0);
    }
  };

  const handleTryoutSubmit = () => {
    // Submit all answers, including unanswered questions
    onQuizComplete?.(results);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswerIndex(null);
    setShowResult(false);
    setResults([]);
    onQuestionChange?.(0);
  };

  const selectedOpsi = selectedAnswerIndex !== null ? question.opsis[selectedAnswerIndex] : null;
  const isCorrect = selectedOpsi?.isCorrect ?? false;
  const correctOpsi = question.opsis.find((o) => o.isCorrect);
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardContent>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">{title}</Text>
          {showProgress && (
            <Badge variant="secondary">
              <Text>{currentQuestion + 1}/{questions.length}</Text>
            </Badge>
          )}
          {tryoutMode && (
            <Badge variant="destructive">
              <Text>Tryout</Text>
            </Badge>
          )}
        </View>

        {/* Question */}
        <View className="mb-4">
          <HtmlRenderer html={question.pertanyaan} />
        </View>

        {/* Options */}
        <View className="gap-2 mb-4">
          {question.opsis.map((opsi, index) => {
            const isSelected = selectedAnswerIndex === index;
            const optionNumber = index + 1;

            return (
              <Button
                key={opsi.id}
                variant={
                  showResult
                    ? opsi.isCorrect
                      ? 'default'
                      : isSelected
                      ? 'destructive'
                      : 'outline'
                    : isSelected
                    ? 'default'
                    : 'outline'
                }
                onPress={() => {
                  if (!showResult) {
                    if (tryoutMode) {
                      handleTryoutAnswerChange(index);
                    } else {
                      handleAnswer(index);
                    }
                  }
                }}
                className="justify-start h-auto min-h-10 py-3"
                disabled={showResult && !tryoutMode}
              >
                <View className="flex-row items-center gap-3 w-full">
                  <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center shrink-0">
                    <Text className="text-xs font-bold">{optionNumber}</Text>
                  </View>
                  <View className="flex-1">
                    <HtmlRenderer html={opsi.opsiText} />
                  </View>
                  {showResult && opsi.isCorrect && (
                    <Icon as={CheckCircle2} size={20} className="text-white mt-0.5 shrink-0" />
                  )}
                  {showResult && isSelected && !opsi.isCorrect && (
                    <Icon as={XCircle} size={20} className="text-white mt-0.5 shrink-0" />
                  )}
                </View>
              </Button>
            );
          })}
        </View>

        {/* Tryout mode: show Next/Submit button when answer is selected */}
        {tryoutMode && selectedAnswerIndex !== null && (
          <View className="flex-row justify-end">
            <Button size="sm" onPress={handleNext}>
              <Text className="text-primary-foreground">
                {isLastQuestion ? 'Kumpulkan' : 'Lanjut'}
              </Text>
              <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
            </Button>
          </View>
        )}

        {/* Result Section (practice mode only) */}
        {showResult && !tryoutMode && (
          <View className="gap-3">
            {!isCorrect && question.explanation && (
              <View className="bg-muted/50 rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold mb-1 text-foreground">Penjelasan:</Text>
                <HtmlRenderer html={question.explanation} />
              </View>
            )}
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
              {tryoutMode ? (
                // Tryout mode: Show "Lanjut" button on all questions (not just last)
                <Button size="sm" onPress={handleNext}>
                  <Text className="text-primary-foreground">
                    {isLastQuestion ? 'Kumpulkan' : 'Lanjut'}
                  </Text>
                  <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
                </Button>
              ) : loopOnComplete ? (
                // Practice mode: Show retry/next buttons
                <Button size="sm" onPress={handleNext}>
                  <Text className="text-primary-foreground">
                    {isLastQuestion ? 'Ulangi' : 'Lanjut'}
                  </Text>
                  <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
                </Button>
              ) : (
                <View className="flex-row gap-2">
                  {isLastQuestion && (
                    <Button size="sm" variant="outline" onPress={handleRetry}>
                      <Text>Ulangi</Text>
                    </Button>
                  )}
                  {!isLastQuestion && (
                    <Button size="sm" onPress={handleNext}>
                      <Text className="text-primary-foreground">Lanjut</Text>
                      <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
                    </Button>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
