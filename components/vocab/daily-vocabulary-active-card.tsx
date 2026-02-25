import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { VocabularyItem } from 'hakgyo-expo-sdk';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Check, Trophy } from 'lucide-react-native';

import { SCREEN_WIDTH, SWIPE_THRESHOLD, formatPos } from './daily-vocabulary-utils';
import { dailyVocabularyStyles } from './daily-vocabulary-styles';

interface ActiveCardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  errorTrigger: number;
  onSwipeComplete: () => void;
  onTranslationChange: (value: number) => void;
  index: number;
  learnedAlert: { vocabId: number; word: string } | null;
}

/**
 * ActiveCard - Handles swipe gestures and has its own animation state
 * Displays the current vocabulary card with flip animation on correct answer
 */
export function ActiveCard({
  item,
  isFlipped,
  errorTrigger,
  onSwipeComplete,
  onTranslationChange,
  index,
  learnedAlert,
}: ActiveCardProps) {
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
        withTiming(55, { duration: 250 }),
        withSpring(0, { damping: 12 }),
        withTiming(-30, { duration: 200 }),
        withSpring(0, { damping: 12 })
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
      <Animated.View style={[dailyVocabularyStyles.card, cardStyle]}>
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
              <CardContent className="items-center justify-center p-6 w-full">
                {learnedAlert && learnedAlert.vocabId === item.id && (
                  <View className="flex-row items-center justify-center bg-success-foreground/20 dark:bg-success-foreground/30 px-3 py-2 rounded-full mb-3">
                    <Icon as={Trophy} size={16} className="text-success-foreground mr-2" />
                    <Text className="text-xs font-medium text-success-foreground text-center">
                      Kamu berhasil hafal!
                    </Text>
                  </View>
                )}
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
