import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Check, Volume2, BookOpen, MessageSquare, Quote } from 'lucide-react-native';
import { VocabularyItem } from '@/data/mock-vocabulary';

interface VocabItemProps {
  item: VocabularyItem;
  onPress?: () => void;
  onAudioPress?: () => void;
}

const TYPE_ICONS = {
  WORD: BookOpen,
  SENTENCE: MessageSquare,
  IDIOM: Quote,
} as const;

const TYPE_COLORS = {
  WORD: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  SENTENCE: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  IDIOM: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
} as const;

export function VocabItem({ item, onPress, onAudioPress }: VocabItemProps) {
  const TypeIcon = TYPE_ICONS[item.type];
  const typeColor = TYPE_COLORS[item.type];

  return (
    <Pressable onPress={onPress}>
      <Card className={`border-primary/20 ${item.isLearned ? 'bg-muted/30' : ''}`}>
        <CardContent className="py-4">
          <View className="flex-row justify-between items-start gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xl font-bold">{item.korean}</Text>
                {item.isLearned && (
                  <Icon as={Check} size={16} className="text-green-500" />
                )}
              </View>
              <Text className="text-base text-muted-foreground mb-2">{item.indonesian}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Badge className={typeColor}>
                  <View className="flex-row items-center gap-1">
                    <Icon as={TypeIcon} size={12} />
                    <Text>{item.type}</Text>
                  </View>
                </Badge>
                {item.pos && (
                  <Badge variant="outline">
                    <Text>{item.pos.replace(/_/g, ' ')}</Text>
                  </Badge>
                )}
              </View>
            </View>
            {item.audioUrl && onAudioPress && (
              <Button
                variant="ghost"
                size="icon"
                onPress={onAudioPress}
                className="rounded-full bg-primary/10 active:bg-primary/20"
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
