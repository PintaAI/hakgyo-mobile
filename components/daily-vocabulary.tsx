import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
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
import { vocabularyApi, useAuth } from 'hakgyo-expo-sdk';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ArrowRight, Check, HelpCircle } from 'lucide-react-native';
import { MOCK_DATA, VocabularyItem } from '@/data/mock-vocabulary';

const SCREEN_WIDTH = 300;
const SWIPE_THRESHOLD = 100;

const formatPos = (pos?: string): string =>
  pos?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';

interface ActiveCardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  errorTrigger: number;
  onSwipeComplete: () => void;
  onTranslationChange: (value: number) => void;
}

// Active card - handles swipe gestures and has its own animation state
function ActiveCard({ item, isFlipped, errorTrigger, onSwipeComplete, onTranslationChange }: ActiveCardProps) {
  const translationX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const errorColorProgress = useSharedValue(0);
  const isExiting = useSharedValue(false);

  // Flip animation
  useEffect(() => {
    if (isFlipped) {
      rotateY.value = withSpring(180);
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
    transform: [{ rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
    ...StyleSheet.absoluteFillObject,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotateY.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
    width: '100%',
    height: '100%',
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View className="relative w-full h-full">
          <Animated.View style={frontStyle}>
            <Card className="w-full h-full bg-card border-primary/20 relative">
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
            <Card className="w-full h-full items-center justify-center bg-green-50 dark:bg-emerald-900 border-green-200 dark:border-green-800">
              <CardContent className="items-center justify-center p-6">
                <Text className="text-3xl font-bold text-center text-green-700 dark:text-green-300 mb-2">
                  {item.indonesian}
                </Text>
                {item.exampleSentences?.[0] && (
                  <Text className="text-xs text-center text-muted-foreground mt-2 italic">
                    "{item.exampleSentences[0]}"
                  </Text>
                )}
                <View className="flex-row items-center mt-4 bg-green-100 dark:bg-green-800 px-3 py-1 rounded-full">
                  <Icon as={Check} size={16} className="text-green-600 dark:text-green-300 mr-1" />
                  <Text className="text-xs font-medium text-green-600 dark:text-green-300">Benar!</Text>
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
      <Card className="w-full h-full bg-card border-primary/20 relative">
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
}

export function DailyVocabulary({ onInputFocusChange }: DailyVocabularyProps) {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [activeTranslation, setActiveTranslation] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const response = await vocabularyApi.getDaily({ userId: user?.id || '', take: 10 });
        setVocabList(response.success && response.data?.length ? response.data : MOCK_DATA);
      } catch {
        setVocabList(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

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
    setCurrentIndex((prev) => (prev >= vocabList.length - 1 ? 0 : prev + 1));
  }, [vocabList.length]);

  const checkAnswer = useCallback(() => {
    const currentVocab = vocabList[currentIndex];
    if (!currentVocab) return;

    if (input.trim().toLowerCase() === currentVocab.indonesian.toLowerCase()) {
      setIsCorrect(true);
    } else {
      setErrorTrigger((prev) => prev + 1);
      setInput('');
    }
  }, [currentIndex, input, vocabList]);

  const handleTranslationChange = useCallback((value: number) => {
    setActiveTranslation(value);
  }, []);

  const currentVocab = vocabList[currentIndex];
  const nextVocab = vocabList[currentIndex + 1] ?? vocabList[0];

  if (loading) {
    return (
      <View className="p-4 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-muted-foreground">Memuat kosakata...</Text>
      </View>
    );
  }

  if (!vocabList.length) {
    return (
      <View className="p-4 items-center justify-center">
        <Text>Data tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <View className="w-full max-w-md mx-auto gap-6">
      <View style={styles.cardStack}>
        {/* Background card (next card) - rendered first so it's behind */}
        {nextVocab && (
          <BackgroundCard
            key={`bg-${currentIndex}`}
            item={nextVocab}
            activeTranslation={activeTranslation}
          />
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
            <View className="gap-2">
              <Input
                className="text-center"
                placeholder="ketik di sini..."
                value={input}
                onChangeText={setInput}
                onSubmitEditing={checkAnswer}
                returnKeyType="done"
                autoCapitalize="none"
                onFocus={() => onInputFocusChange?.(true)}
                onBlur={() => onInputFocusChange?.(false)}
              />
              {showHint && currentVocab && (
                <Text className="text-xs text-muted-foreground ml-1">
                  Petunjuk: Dimulai dengan "{currentVocab.indonesian[0]}..." ({currentVocab.indonesian.length} huruf)
                </Text>
              )}
            </View>

            <View className="flex-row gap-2">
              <Button className="flex-1" onPress={checkAnswer}>
                <Text>Cek Jawaban</Text>
              </Button>
              <Button variant="outline" size="icon" onPress={() => setShowHint(true)}>
                <Icon as={HelpCircle} size={20} className="text-foreground" />
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
});
