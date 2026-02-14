import React from 'react';
import { View } from 'react-native';
import { VocabCard } from './vocab-card';
import { VocabularyItem } from '@/data/mock-vocabulary';

interface VocabListProps {
  vocabulary: VocabularyItem[];
}

export function VocabList({ vocabulary }: VocabListProps) {
  return (
    <View className="p-4 gap-3">
      {vocabulary.map((item) => (
        <VocabCard key={item.id} item={item} />
      ))}
    </View>
  );
}
