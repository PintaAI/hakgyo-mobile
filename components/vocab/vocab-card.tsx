import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Check } from 'lucide-react-native';
import { VocabularyItem } from '@/data/mock-vocabulary';

interface VocabCardProps {
  item: VocabularyItem;
}

export function VocabCard({ item }: VocabCardProps) {
  return (
    <Card className="border-primary/20">
      <CardContent>
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xl font-bold mb-1">{item.korean}</Text>
            <Text className="text-base text-muted-foreground mb-2">{item.indonesian}</Text>
            <View className="flex-row gap-2">
              <Badge variant="secondary">
                <Text>{item.type}</Text>
              </Badge>
              {item.pos && (
                <Badge variant="outline">
                  <Text>{item.pos.replace(/_/g, ' ')}</Text>
                </Badge>
              )}
            </View>
            {item.exampleSentences?.[0] && (
              <Text className="text-sm text-muted-foreground mt-2 italic">
                "{item.exampleSentences[0]}"
              </Text>
            )}
          </View>
          {item.isLearned && (
            <Icon as={Check} size={20} className="text-green-500" />
          )}
        </View>
      </CardContent>
    </Card>
  );
}
