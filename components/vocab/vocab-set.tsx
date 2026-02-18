import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react-native';

export interface VocabularySet {
  id: number;
  title: string;
  description: string;
  itemCount: number;
  learnedCount: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt: string;
  updatedAt: string;
}

interface VocabSetProps {
  set: VocabularySet;
  onPress?: () => void;
}

const LEVEL_COLORS = {
  BEGINNER: 'bg-green-500/10 text-green-600 border-green-500/20',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  ADVANCED: 'bg-red-500/10 text-red-600 border-red-500/20',
} as const;

export function VocabSet({ set, onPress }: VocabSetProps) {
  const progress = set.itemCount > 0 ? (set.learnedCount / set.itemCount) * 100 : 0;
  const levelColor = set.level ? LEVEL_COLORS[set.level] : null;

  return (
    <Pressable onPress={onPress}>
      <Card className="border-primary/20">
        <CardHeader>
          <View className="flex-row justify-between items-start gap-2">
            <View className="flex-1">
              <CardTitle className="text-lg mb-1">{set.title}</CardTitle>
              <CardDescription numberOfLines={2}>{set.description}</CardDescription>
            </View>
            {set.level && levelColor && (
              <Badge className={levelColor}>
                <Text>{set.level}</Text>
              </Badge>
            )}
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex-row items-center gap-4 mb-3">
            <View className="flex-row items-center gap-1.5">
              <Icon as={BookOpen} size={16} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {set.itemCount} {set.itemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon as={CheckCircle} size={16} className="text-green-500" />
              <Text className="text-sm text-muted-foreground">
                {set.learnedCount} learned
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </View>

          {/* Progress Text */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-muted-foreground">
              {progress.toFixed(0)}% complete
            </Text>
            {progress === 100 ? (
              <View className="flex-row items-center gap-1">
                <Icon as={CheckCircle} size={14} className="text-green-500" />
                <Text className="text-xs text-green-500 font-medium">Completed</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1">
                <Icon as={TrendingUp} size={14} className="text-primary" />
                <Text className="text-xs text-primary font-medium">
                  {set.itemCount - set.learnedCount} remaining
                </Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
