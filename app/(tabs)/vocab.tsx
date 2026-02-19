import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VocabSet } from '@/components/vocab';
import { VocabItemsDrawer } from '@/components/vocab';
import { VocabItemBottomSheet } from '@/components/vocab';
import { Alert } from '@/components/ui/alert';
import { vocabularyApi } from 'hakgyo-expo-sdk';
import { AlertCircle } from 'lucide-react-native';
import type { VocabularySet } from 'hakgyo-expo-sdk';
import type { VocabularyItem } from 'hakgyo-expo-sdk';

export default function VocabScreen() {
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);
  const [vocabSets, setVocabSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVocabSets();
  }, []);

  const fetchVocabSets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await vocabularyApi.listSets({ page: 1, limit: 20 });
      console.log('Vocab sets response:', response);
      if (response.success && response.data?.data) {
        // response.data is PaginatedResponse<VocabularySet>, response.data.data is VocabularySet[]
        console.log('Vocab sets data:', response.data.data);
        setVocabSets(response.data.data);
      } else {
        setError(response.error || 'Failed to load vocabulary sets');
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching vocab sets:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchVocabSets(true);
  }, []);

  const handleSetPress = useCallback((setId: number) => {
    setSelectedSetId(setId);
  }, []);

  const handleItemPress = useCallback((item: VocabularyItem) => {
    setSelectedItem(item);
     // Close drawer when item is pressed
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-bold">Kosa-kata</Text>
          <Text className="text-xs  text-muted-foreground mt-0.5">
            {vocabSets.length} set tersedia
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <View className="px-4 py-2">
            <Alert variant="destructive" icon={AlertCircle}>
              <Text className="text-sm">{error}</Text>
            </Alert>
          </View>
        )}

        {/* Loading State */}
        {loading || refreshing ? (
          <View className="p-4 gap-3">
            {[...Array(3)].map((_, i) => (
              <View key={i} className="border border-border/50 rounded-lg p-4 gap-3">
                {/* Icon & Title Row */}
                <View className="flex-row items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-md" />
                  <View className="flex-1 gap-1">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </View>
                  <Skeleton className="w-5 h-5 rounded-md" />
                </View>
                {/* Stats Row */}
                <View className="flex-row items-center gap-4">
                  <Skeleton className="w-16 h-3 rounded-md" />
                  <Skeleton className="w-20 h-3 rounded-md" />
                  <Skeleton className="w-16 h-3 rounded-md ml-auto" />
                </View>
                {/* Progress Bar */}
                <Skeleton className="h-1.5 w-full rounded-full" />
                {/* Progress Text */}
                <View className="flex-row justify-between">
                  <Skeleton className="w-12 h-3 rounded-md" />
                  <Skeleton className="w-16 h-3 rounded-md" />
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Content - Vocab Sets List */
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="p-4 gap-3">
              {vocabSets.map((set) => (
                <VocabSet
                  key={set.id}
                  set={set}
                  onPress={() => handleSetPress(set.id)}
                />
              ))}
              {vocabSets.length === 0 && !error && (
                <View className="py-10 items-center">
                  <Text className="text-muted-foreground">No vocabulary sets available</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Vocab Items Drawer */}
      {selectedSetId && (
        <VocabItemsDrawer
          key={`drawer-${selectedSetId}`}
          setId={selectedSetId}
          isOpen={!!selectedSetId}
          onClose={handleCloseDrawer}
          onItemPress={handleItemPress}
          set={vocabSets.find((s) => s.id === selectedSetId)}
        >
          {/* Vocab Item Detail Bottom Sheet - Rendered inside the Modal if needed, but since BottomSheet needs gesture handling,
              it might be tricky inside a Modal. However, the requirement is to show it ON TOP.
              Since VocabItemsDrawer is now a Modal, anything outside it is covered.
              So we should pass the BottomSheet as a child or render it inside the Drawer.
              But BottomSheet is usually a global overlay.
              
              Better approach:
              Pass the BottomSheet as children to VocabItemsDrawer? No, Drawer is a specific component.
              
              Actually, if VocabItemsDrawer is a Modal, we can't easily put another view on top of it unless it's another Modal.
              @gorhom/bottom-sheet uses React Native Gesture Handler and Reanimated.
              Using it inside a Modal is possible.
          */}
          {selectedItem && (
            <VocabItemBottomSheet
              key={`bottom-sheet-${selectedItem.id}`}
              item={selectedItem}
              onClose={handleCloseBottomSheet}
              onAudioPress={handleAudioPress}
            />
          )}
        </VocabItemsDrawer>
      )}
    </SafeAreaView>
  );
}
