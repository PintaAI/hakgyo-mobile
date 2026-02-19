import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Check, Volume2, BookOpen, MessageSquare, Quote, ChevronRight } from 'lucide-react-native';
import type { VocabularyItem } from 'hakgyo-expo-sdk';

interface VocabItemProps {
  item: VocabularyItem;
  onPress?: () => void;
  onAudioPress?: () => void;
  compact?: boolean;
  isLearned?: boolean;
}

const TYPE_ICONS = {
  WORD: BookOpen,
  SENTENCE: MessageSquare,
  IDIOM: Quote,
} as const;

const TYPE_COLORS = {
  WORD: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50',
  SENTENCE: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/50',
  IDIOM: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/50',
} as const;

export function VocabItem({ item, onPress, onAudioPress, compact = false, isLearned = false }: VocabItemProps) {
  const TypeIcon = TYPE_ICONS[item.type];
  const typeColor = TYPE_COLORS[item.type];

  if (compact) {
    return (
      <Pressable onPress={onPress} className="active:bg-muted/20">
        <View className={`border-b border-border/35 px-2 py-2.5 flex-row items-center gap-2 ${isLearned ? 'opacity-70' : ''}`}>
          <View className={`h-6 w-6 rounded-md border items-center justify-center ${typeColor}`}>
            <Icon as={TypeIcon} size={12} />
          </View>

          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
                {item.korean}
              </Text>
              {isLearned && (
                <View className="h-4 w-4 rounded-full items-center justify-center bg-green-500/15">
                  <Icon as={Check} size={10} className="text-green-600 dark:text-green-400" />
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {item.indonesian}
              </Text>
              {item.pos && (
                <Text className="text-[10px] uppercase tracking-wide text-muted-foreground/80" numberOfLines={1}>
                  • {item.pos.replace(/_/g, ' ')}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center gap-0.5">
            {item.audioUrl && onAudioPress && (
              <Button
                variant="ghost"
                size="icon"
                onPress={onAudioPress}
                className="h-7 w-7 rounded-full active:bg-primary/10"
              >
                <Icon as={Volume2} size={14} className="text-primary/80" />
              </Button>
            )}
            <Icon as={ChevronRight} size={14} className="text-muted-foreground/50" />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Card className={`border-primary/20 relative ${isLearned ? 'bg-muted/30' : ''}`}>
        <View className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className={typeColor}>
            <View className="flex-row items-center gap-1">
              <Icon as={TypeIcon} size={12} />
              <Text className="font-semibold">{item.type}</Text>
            </View>
          </Badge>
        </View>
        
        <CardContent>
          <View className="flex-row justify-between items-start gap-3 pt-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xl font-bold">{item.korean}</Text>
                {isLearned && (
                  <Icon as={Check} size={16} className="text-green-500" />
                )}
              </View>
              <Text className="text-base text-muted-foreground mb-2">{item.indonesian}</Text>
              <View className="flex-row flex-wrap gap-2">
                {item.pos && (
                  <Badge variant="outline" className="dark:border-muted-foreground/40">
                    <Text className="dark:text-muted-foreground">{item.pos.replace(/_/g, ' ')}</Text>
                  </Badge>
                )}
              </View>
            </View>
            {item.audioUrl && onAudioPress && (
              <Button
                variant="ghost"
                size="icon"
                onPress={onAudioPress}
                className="rounded-full bg-primary/10 active:bg-primary/20 mt-6"
              >
                <Icon as={Volume2} size={20} className="text-primary" />
              </Button>
            )}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
