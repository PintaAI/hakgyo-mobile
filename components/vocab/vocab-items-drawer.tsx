import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Dimensions, Modal, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { VocabItem } from './vocab-item';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vocabularyApi } from 'hakgyo-expo-sdk';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle,  withTiming, runOnJS } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import type { VocabularySet } from 'hakgyo-expo-sdk';
import type { VocabularyItem } from 'hakgyo-expo-sdk';

interface VocabItemsDrawerProps {
  setId?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onItemPress?: (item: VocabularyItem) => void;
  set?: VocabularySet;
  children?: React.ReactNode;
  learnedItemIds?: Set<number>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function VocabItemsDrawer({
  setId,
  isOpen = true,
  onClose,
  onItemPress,
  set: setProp,
  children,
  learnedItemIds: learnedItemIdsProp,
}: VocabItemsDrawerProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const translateX = useSharedValue(SCREEN_WIDTH);
  const context = useSharedValue({ x: 0 });

  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 });
    }
  }, [isOpen]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-20, 20]) // Only activate if moved 20px horizontally
    .failOffsetY([-20, 20])   // Fail if moved 20px vertically
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      const newValue = context.value.x + event.translationX;
      // Clamp to not pull left past 0
      translateX.value = Math.max(0, newValue);
    })
    .onEnd((event) => {
      if (translateX.value > SCREEN_WIDTH * 0.25 || event.velocityX > 500) {
        // Animate out then close
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, (finished) => {
          if (finished && onClose) {
            runOnJS(onClose)();
          }
        });
      } else {
        // Snap back
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    if (setId && setId > 0) {
      fetchVocabItems();
    }
  }, [setId]);

  const fetchVocabItems = async () => {
    if (!setId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all items
      const itemsResponse = await vocabularyApi.listItems({ collectionId: setId.toString() });

      if (itemsResponse.success && itemsResponse.data?.data) {
        setItems(itemsResponse.data.data);
      } else {
        setError(itemsResponse.error || 'Failed to load vocabulary items');
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching vocab items:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: VocabularyItem) => {
    onItemPress?.(item);
  };

  const drawerWidth = Math.min(SCREEN_WIDTH * 0.85, 400);

  const handleCloseWithAnimation = () => {
    translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, (finished) => {
      if (finished && onClose) {
        runOnJS(onClose)();
      }
    });
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleCloseWithAnimation}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 z-50">
          {/* Backdrop */}
          <Pressable
            onPress={handleCloseWithAnimation}
            className="absolute inset-0 bg-black/50"
          />

        {/* Drawer Content */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[{
              width: drawerWidth,
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              shadowColor: '#000',
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 4,
              paddingTop: insets.top,
              backgroundColor: NAV_THEME[colorScheme ?? 'light'].colors.background,
            }, rStyle]}
            className="border-l border-border"
          >
            {/* Header & Description */}
            <View style={styles.header} className="px-4 py-3 bg-background flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-lg font-bold tracking-tight" numberOfLines={1}>
                  {setProp?.title || 'Vocab Items'}
                </Text>
                {setProp?.description && (
                  <Text className="text-xs text-muted-foreground leading-snug mt-1" numberOfLines={1}>
                    {setProp.description}
                  </Text>
                )}
              </View>
              <View className="bg-muted rounded-full p-1 items-center justify-center">
                <Text className="text-xs text-muted-foreground font-medium">
                  {items.length}
                </Text>
              </View>
            </View>
            {/* Content */}
            <ScrollView className="flex-1 px-3" >
              {loading ? (
                <View className="mt-2 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <View key={i} className="border-b border-border/35 px-2 py-2.5 flex-row items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <View className="flex-1 min-w-0 gap-1.5">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                      </View>
                      <Skeleton className="h-7 w-7 rounded-full" />
                    </View>
                  ))}
                </View>
              ) : error ? (
                <View className="py-10 items-center">
                  <Text className="text-destructive text-sm">{error}</Text>
                </View>
              ) : items.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-muted-foreground">No vocabulary items available</Text>
                </View>
              ) : (
                <View className="mt-2 gap-2">
                  {items.map((item) => (
                    <VocabItem
                      key={item.id}
                      item={item}
                      compact
                      isLearned={learnedItemIdsProp?.has(item.id) ?? false}
                      onPress={() => handleItemPress(item)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
          {children}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
});
