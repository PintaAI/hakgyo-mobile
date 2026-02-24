import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert as RNAlert, StyleSheet, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { vocabularyApi, useAuth, VocabularyItem } from 'hakgyo-expo-sdk';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Alert } from '@/components/ui/alert';
import { ArrowRight, Check, HelpCircle, RefreshCw, Send, Trophy } from 'lucide-react-native';

const SCREEN_WIDTH = 300;
const SWIPE_THRESHOLD = 10;

const formatPos = (pos?: string): string =>
  pos?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';

interface ActiveCardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  errorTrigger: number;
  onSwipeComplete: () => void;
  onTranslationChange: (value: number) => void;
  index: number;
}

// Active card - handles swipe gestures and has its own animation state
function ActiveCard({ item, isFlipped, errorTrigger, onSwipeComplete, onTranslationChange, index }: ActiveCardProps) {
  const translationX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const errorColorProgress = useSharedValue(0);
  const isExiting = useSharedValue(false);

  // Flip animation - use timing with ease for natural card flip
  useEffect(() => {
    if (isFlipped) {
      rotateY.value = withTiming(180, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    } else {
      rotateY.value = withTiming(0, { duration: 300 });
    }
  }, [isFlipped, rotateY]);

  // Error shake animation
  useEffect(() => {
    if (errorTrigger > 0) {
      shakeX.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      errorColorProgress.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 400 })
      );
    }
  }, [errorTrigger, shakeX, errorColorProgress]);

  // Teasing swipe hint animation on mount - simulates a natural swipe gesture
  // Only runs for the first card (index === 0)
  useEffect(() => {
    if (index !== 0) return;
    const timer = setTimeout(() => {
      if (isExiting.value) return;
      translationX.value = withSequence(
        withTiming(55,  { duration: 250 }),
        withSpring(0,   { damping: 12 }),
        withTiming(-30, { duration: 200 }),
        withSpring(0,   { damping: 12 })
      );
    }, 300);
    return () => clearTimeout(timer);
  }, []); // empty deps = run once on mount only

  // Notify parent of translation changes for the background card scale effect
  useDerivedValue(() => {
    runOnJS(onTranslationChange)(translationX.value);
  }, [translationX]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          if (!isExiting.value) {
            translationX.value = e.translationX;
          }
        })
        .onEnd((e) => {
          if (isExiting.value) return;

          if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
            isExiting.value = true;
            const exitDirection = e.translationX > 0 ? 500 : -500;
            translationX.value = withTiming(exitDirection, { duration: 200 }, (finished) => {
              if (finished) {
                runOnJS(onSwipeComplete)();
              }
            });
          } else {
            translationX.value = withSpring(0);
          }
        }),
    [isExiting, onSwipeComplete, translationX]
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value + shakeX.value },
      {
        rotateZ: `${interpolate(
          translationX.value,
          [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          [-15, 0, 15],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
    zIndex: 10,
  }));

  const errorOverlayStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(errorColorProgress.value, [0, 1], ['transparent', 'rgba(239, 68, 68, 0.25)']),
    borderColor: interpolateColor(errorColorProgress.value, [0, 1], ['transparent', 'rgba(239, 68, 68, 0.8)']),
    borderWidth: 2,
    borderRadius: 12,
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    pointerEvents: 'none' as const,
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
    ...StyleSheet.absoluteFillObject,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value + 180}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
    width: '100%',
    height: '100%',
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View className="relative w-full h-full">
          <Animated.View style={frontStyle}>
            <Card className="w-full h-full bg-card border-primary/20 relative shadow-md elevation-5">
              <View className="absolute top-3 left-3 z-10">
                <Badge variant="secondary">
                  <Text>{formatPos(item.pos) || item.type}</Text>
                </Badge>
              </View>
              <CardContent className="w-full h-full items-center justify-center p-6">
                <Text className="text-4xl font-bold text-center">{item.korean}</Text>
              </CardContent>
            </Card>
          </Animated.View>

          <Animated.View style={backStyle}>
            <Card className="w-full h-full items-center justify-center bg-success dark:bg-success border-success dark:border-success shadow-md elevation-5">
              <CardContent className="items-center justify-center p-6">
                <Text className="text-3xl font-bold text-center text-success-foreground mb-2">
                  {item.indonesian}
                </Text>
                {item.exampleSentences?.[0] && (
                  <Text className="text-xs text-center text-success-foreground/80 mt-2 italic">
                    "{item.exampleSentences[0]}"
                  </Text>
                )}
                <View className="flex-row items-center mt-4 bg-success-foreground/20 dark:bg-success-foreground/30 px-3 py-1 rounded-full">
                  <Icon as={Check} size={16} className="text-success-foreground mr-1" />
                  <Text className="text-xs font-medium text-success-foreground">Benar!</Text>
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          <Animated.View style={errorOverlayStyle} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

interface BackgroundCardProps {
  item: VocabularyItem;
  activeTranslation: number;
}

// Background card - purely visual, scales based on active card's translation
function BackgroundCard({ item, activeTranslation }: BackgroundCardProps) {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    const targetScale = interpolate(
      Math.abs(activeTranslation),
      [0, SCREEN_WIDTH / 2],
      [0.9, 1],
      Extrapolation.CLAMP
    );
    scale.value = withTiming(targetScale, { duration: 16 });
  }, [activeTranslation, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    zIndex: 5,
  }));

  return (
    <Animated.View style={[styles.card, styles.cardInactive, cardStyle]}>
      <Card className="w-full h-full bg-card border-primary/20 relative shadow-md elevation-5">
        <View className="absolute top-3 left-3 z-10">
          <Badge variant="secondary">
            <Text>{formatPos(item.pos) || item.type}</Text>
          </Badge>
        </View>
        <CardContent className="w-full h-full items-center justify-center p-6">
          <Text className="text-4xl font-bold text-center">{item.korean}</Text>
        </CardContent>
      </Card>
    </Animated.View>
  );
}

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
        <View style={styles.cardStack}>
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
      {/* Learned Alert */}
      {learnedAlert && (
        <Alert icon={Trophy} iconClassName="text-success" className="mb-2">
          <Text className="text-success pl-6 font-medium">
            Kamu berhasil hafal kosa kata "{learnedAlert.word}"!
          </Text>
        </Alert>
      )}

      <View style={styles.cardStack}>
        {/* Word count indicator - top right corner */}
        <View style={styles.wordCountBadge}>
          <Text className="text-sm font-medium text-muted-foreground">
            {processedItems.size}/{vocabList.length}
          </Text>
        </View>

        {/* Correct attempts progress indicator - top left corner */}
        {currentVocab && (
          <View style={styles.progressBadge}>
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
          <View style={styles.hintText}>
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
          <View style={styles.refreshingOverlay}>
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

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardInactive: {
    top: 0,
    left: 0,
  },
  cardStack: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  wordCountBadge: {
    position: 'absolute',
    top: -35,
    right: 8,
    zIndex: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintText: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    zIndex: 25,
    alignItems: 'center',
  },
  refreshingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  progressBadge: {
    position: 'absolute',
    top: 5,
    left: '50%',
    transform: [{ translateX: -25 }],
    zIndex: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
