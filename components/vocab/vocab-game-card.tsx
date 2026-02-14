import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VocabularyItem } from '@/data/mock-vocabulary';

interface VocabGameCardProps {
  vocab: VocabularyItem;
  showAnswer: boolean;
}

export function VocabGameCard({ vocab, showAnswer }: VocabGameCardProps) {
  return (
    <Card className="border-primary/20 min-h-64">
      <CardContent className="items-center justify-center min-h-64">
        <View className="items-center gap-4">
          <Badge variant="secondary">
            <Text>{vocab.type}</Text>
          </Badge>
          <Text className="text-3xl font-bold text-center">{vocab.korean}</Text>

          {showAnswer ? (
            <View className="items-center gap-2">
              <Text className="text-2xl text-center text-primary">{vocab.indonesian}</Text>
              {vocab.exampleSentences?.[0] && (
                <Text className="text-sm text-center text-muted-foreground italic">
                  "{vocab.exampleSentences[0]}"
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-muted-foreground">Ketuk untuk melihat jawaban</Text>
          )}
        </View>
      </CardContent>
    </Card>
  );
}
