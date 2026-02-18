import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VocabSet } from '@/components/vocab';
import { MOCK_VOCAB_SETS } from '@/data/mock-vocab-sets';
import { VocabularyItem } from '@/data/mock-vocabulary';
import { VocabItemsDrawer } from '@/components/vocab';
import { VocabItemBottomSheet } from '@/components/vocab';

export default function VocabScreen() {
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);

  const handleSetPress = useCallback((setId: number) => {
    setSelectedSetId(setId);
  }, []);

  const handleItemPress = useCallback((item: VocabularyItem) => {
    setSelectedItem(item);
    setSelectedSetId(null); // Close drawer when item is pressed
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedSetId(null);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleAudioPress = useCallback(() => {
    if (selectedItem) {
      console.log('Play audio for:', selectedItem.korean);
    }
  }, [selectedItem]);

  const handleShare = useCallback(() => {
    if (selectedItem) {
      console.log('Share item:', selectedItem.korean);
    }
  }, [selectedItem]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-semibold">Kosakata</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {MOCK_VOCAB_SETS.length} set tersedia
          </Text>
        </View>

        {/* Content - Vocab Sets List */}
        <ScrollView className="flex-1 px-4 py-2">
          <View className="gap-3">
            {MOCK_VOCAB_SETS.map((set) => (
              <VocabSet
                key={set.id}
                set={set}
                onPress={() => handleSetPress(set.id)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Vocab Items Drawer */}
      {selectedSetId && (
        <VocabItemsDrawer
          key={`drawer-${selectedSetId}`}
          setId={selectedSetId}
          isOpen={!!selectedSetId}
          onClose={handleCloseDrawer}
          onItemPress={handleItemPress}
        />
      )}

      {/* Vocab Item Detail Bottom Sheet */}
      {selectedItem && (
        <VocabItemBottomSheet
          key={`bottom-sheet-${selectedItem.id}`}
          item={selectedItem}
          onClose={handleCloseBottomSheet}
          onAudioPress={handleAudioPress}
          onShare={handleShare}
        />
      )}
    </SafeAreaView>
  );
}
