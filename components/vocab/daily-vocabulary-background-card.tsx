import React, { useEffect } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { VocabularyItem } from 'hakgyo-expo-sdk';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { SCREEN_WIDTH } from './daily-vocabulary-utils';
import { dailyVocabularyStyles } from './daily-vocabulary-styles';
import { View } from 'react-native';

interface BackgroundCardProps {
  item: VocabularyItem;
  activeTranslation: number;
}

/**
 * BackgroundCard - Purely visual, scales based on active card's translation
 * Shows the next vocabulary card in the stack
 */
export function BackgroundCard({ item, activeTranslation }: BackgroundCardProps) {
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
    <Animated.View style={[dailyVocabularyStyles.card, dailyVocabularyStyles.cardInactive, cardStyle]}>
      <Card className="w-full h-full bg-card border-primary/20 relative shadow-md elevation-5">
        <View className="absolute top-3 left-3 z-10">
          <Badge variant="secondary">
            <Text>{item.pos?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? item.type}</Text>
          </Badge>
        </View>
        <CardContent className="w-full h-full items-center justify-center p-6">
          <Text className="text-4xl font-bold text-center">{item.korean}</Text>
        </CardContent>
      </Card>
    </Animated.View>
  );
}
