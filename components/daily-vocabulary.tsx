import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert as RNAlert, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vocabularyApi, useAuth, VocabularyItem } from 'hakgyo-expo-sdk';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ArrowRight, HelpCircle, RefreshCw, Send } from 'lucide-react-native';

import { ActiveCard } from '@/components/vocab/daily-vocabulary-active-card';
import { BackgroundCard } from '@/components/vocab/daily-vocabulary-background-card';
import { dailyVocabularyStyles } from '@/components/vocab/daily-vocabulary-styles';

interface DailyVocabularyProps {
  onInputFocusChange?: (isFocused: boolean) => void;
  onStatsUpdate?: (xpGained: number) => void;
}

export function DailyVocabulary({ onInputFocusChange, onStatsUpdate }: DailyVocabularyProps) {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [activeTranslation, setActiveTranslation] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState<Record<number, number>>({});
  const [processedItems, setProcessedItems] = useState<Set<number>>(new Set());
  const [hasTried, setHasTried] = useState(false);
  const [learnedAlert, setLearnedAlert] = useState<{ vocabId: number; word: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { user } = useAuth();

  const CORRECT_ATTEMPTS_KEY = `vocab_correct_attempts_${user?.id || 'guest'}`;

  // Load persisted correctAttempts from AsyncStorage on mount
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const stored = await AsyncStorage.getItem(CORRECT_ATTEMPTS_KEY);
        if (stored) {
          setCorrectAttempts(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    };
    loadAttempts();
  }, [CORRECT_ATTEMPTS_KEY]);

  const fetchDailyVocab = useCallback(async () => {
    try {
      const response = await vocabularyApi.getDaily({ userId: user?.id || '', take: 10 });
      setVocabList(response.success && response.data?.length ? response.data : []);
    } catch {
      setVocabList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDailyVocab();
  }, [fetchDailyVocab]);

  useEffect(() => {
    return () => {
      onInputFocusChange?.(false);
    };
  }, [onInputFocusChange]);

  const nextCard = useCallback(() => {
    setInput('');
    setIsCorrect(false);
    setShowHint(false);
    setErrorTrigger(0);
    setActiveTranslation(0);
    setLearnedAlert(null); // Clear learned alert when moving to next card
    setCurrentIndex((prev) => (prev >= vocabList.length - 1 ? 0 : prev + 1));
    // Focus input and open keyboard after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [vocabList.length]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentIndex(0);
    setInput('');
    setIsCorrect(false);
    setShowHint(false);
    setErrorTrigger(0);
    setActiveTranslation(0);
    setHasTried(false);
    // Do NOT reset correctAttempts — keep counts so they survive auto-refresh
    setProcessedItems(new Set());
    setLearnedAlert(null);
    fetchDailyVocab();
  }, [fetchDailyVocab]);

  // Show dialog when all items are completed
  useEffect(() => {
    if (hasTried && !refreshing) {
      const timer = setTimeout(() => {
        RNAlert.alert(
          '🎉 Selesai!',
          'Kamu telah menyelesaikan semua kosa kata. Ingin latihan dengan kosa kata baru atau ulangi yang sama?',
          [
            {
              text: 'Ulangi yang Sama',
              style: 'cancel',
              onPress: () => {
                // Reset progress but keep same vocab list
                setCurrentIndex(0);
                setInput('');
                setIsCorrect(false);
                setShowHint(false);
                setErrorTrigger(0);
                setActiveTranslation(0);
                setHasTried(false);
                setProcessedItems(new Set());
                setLearnedAlert(null);
              },
            },
            {
              text: 'Kosa Kata Baru',
              onPress: handleRefresh,
            },
          ]
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasTried, refreshing, handleRefresh]);

  const markAsLearned = useCallback(async (vocabId: number, isLearned: boolean) => {
    // Optimistically update stats BEFORE API call for immediate feedback
    if (isLearned) {
      // COMPLETE_VOCABULARY event awards 5 XP according to gamification docs
      onStatsUpdate?.(5);
    }
    
    try {
      await vocabularyApi.setLearnedStatus(vocabId, isLearned);
    } catch (error) {
      // silently fail — learned status is best-effort
    }
  }, [onStatsUpdate]);

  const checkAnswer = useCallback(() => {
    const currentVocab = vocabList[currentIndex];
    if (!currentVocab) return;

    const vocabId = currentVocab.id;
    const isAnswerCorrect = input.trim().toLowerCase() === currentVocab.indonesian.toLowerCase();

    if (isAnswerCorrect) {
      setIsCorrect(true);

      // Compute new count outside updater to avoid calling setState inside setState
      setCorrectAttempts((prev) => {
        const newCount = (prev[vocabId] || 0) + 1;
        
        if (newCount >= 3) {
          // Remove from persisted attempts since it's fully learned
          const { [vocabId]: _, ...rest } = { ...prev, [vocabId]: newCount };
          AsyncStorage.setItem(CORRECT_ATTEMPTS_KEY, JSON.stringify(rest)).catch(() => {});
          return rest;
        }
        
        const updated = { ...prev, [vocabId]: newCount };
        AsyncStorage.setItem(CORRECT_ATTEMPTS_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });

      // Check current count to trigger side effects — read from state ref via functional update
      const currentCount = (correctAttempts[vocabId] || 0) + 1;
      if (currentCount >= 3) {
        markAsLearned(vocabId, true);
        setLearnedAlert({ vocabId, word: currentVocab.korean });
      }

      const newProcessed = new Set(processedItems).add(vocabId);
      setProcessedItems(newProcessed);
      if (newProcessed.size >= vocabList.length) {
        setHasTried(true);
      }
    } else {
      setErrorTrigger((prev) => prev + 1);
      setInput('');
      
      // Immediately mark as not learned on incorrect answer
      markAsLearned(vocabId, false);
      
      const newProcessed = new Set(processedItems).add(vocabId);
      setProcessedItems(newProcessed);
      if (newProcessed.size >= vocabList.length) {
        setHasTried(true);
      }
    }
  }, [currentIndex, input, vocabList, markAsLearned, processedItems, correctAttempts, CORRECT_ATTEMPTS_KEY]);

  const handleTranslationChange = useCallback((value: number) => {
    setActiveTranslation(value);
  }, []);

  const currentVocab = vocabList[currentIndex];
  const nextVocab = vocabList[currentIndex + 1] ?? vocabList[0];

  if (loading) {
    return (
      <View className="w-full max-w-md mx-auto gap-6">
        <View style={dailyVocabularyStyles.cardStack}>
          <Skeleton className="w-full h-full rounded-xl" />
        </View>
        <View className="gap-4">
          <View className="flex-row gap-2">
            <Skeleton className="w-10 h-10 rounded-md" />
            <Skeleton className="flex-1 h-10 rounded-md" />
            <Skeleton className="w-10 h-10 rounded-md" />
          </View>
        </View>
      </View>
    );
  }

  if (!vocabList.length) {
    return (
      <View className="p-4 items-center justify-center gap-4">
        <Text>Data tidak ditemukan.</Text>
        <Button variant="outline" onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Skeleton className="w-4 h-4 rounded-full" />
          ) : (
            <Icon as={RefreshCw} size={16} />
          )}
          <Text className="ml-2">Refresh</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="w-full max-w-md mx-auto gap-6">
      <View style={dailyVocabularyStyles.cardStack}>
        {/* Word count indicator - top right corner */}
        <View style={dailyVocabularyStyles.wordCountBadge}>
          <Text className="text-sm font-medium text-muted-foreground">
            {processedItems.size}/{vocabList.length}
          </Text>
        </View>

        {/* Correct attempts progress indicator - top left corner */}
        {currentVocab && (
          <View style={dailyVocabularyStyles.progressBadge}>
            <View className="flex-row items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <View
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < (correctAttempts[currentVocab.id] || 0)
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </View>
          </View>
        )}

        {/* Hint text - bottom center of card */}
        {showHint && currentVocab && (
          <View style={dailyVocabularyStyles.hintText}>
            <Text className="text-xs text-muted-foreground text-center">
              Petunjuk: Dimulai dengan "{currentVocab.indonesian[0]}..." ({currentVocab.indonesian.length} huruf)
            </Text>
          </View>
        )}

        {/* Background card (next card) - rendered first so it's behind */}
        {nextVocab && (
          <BackgroundCard
            key={`bg-${currentIndex}`}
            item={nextVocab}
            activeTranslation={activeTranslation}
          />
        )}

        {/* Skeleton overlay when refreshing */}
        {refreshing && (
          <View style={dailyVocabularyStyles.refreshingOverlay}>
            <Skeleton className="w-full h-full rounded-xl" />
          </View>
        )}

        {/* Active card - rendered second so it's on top */}
        {currentVocab && (
          <ActiveCard
            key={`active-${currentIndex}`}
            item={currentVocab}
            isFlipped={isCorrect}
            errorTrigger={errorTrigger}
            onSwipeComplete={nextCard}
            onTranslationChange={handleTranslationChange}
            index={currentIndex}
            learnedAlert={learnedAlert}
          />
        )}
      </View>

      <View className="gap-4">
        {isCorrect ? (
          <Button className="w-full" onPress={nextCard}>
            <Text className="mr-2">Kata Selanjutnya</Text>
            <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
          </Button>
        ) : (
          <>
            <View className="flex-row gap-2">
              <Button variant="outline" size="icon" onPress={() => setShowHint(true)}>
                <Icon as={HelpCircle} size={20} className="text-foreground" />
              </Button>
              <Input
                ref={inputRef}
                className="flex-1 text-center"
                placeholder="ketik di sini..."
                value={input}
                onChangeText={setInput}
                onSubmitEditing={checkAnswer}
                returnKeyType="done"
                autoCapitalize="none"
                onFocus={() => onInputFocusChange?.(true)}
                onBlur={() => onInputFocusChange?.(false)}
              />
              <Button variant="outline" size="icon" onPress={checkAnswer}>
                <Icon as={Send} size={20} className="text-foreground" />
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
