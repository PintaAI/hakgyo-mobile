import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Pressable, Animated, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { X } from 'lucide-react-native';
import { VocabItem } from './vocab-item';
import { MOCK_DATA } from '@/data/mock-vocabulary';
import { MOCK_VOCAB_SETS } from '@/data/mock-vocab-sets';
import { VocabularyItem } from '@/data/mock-vocabulary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VocabItemsDrawerProps {
  setId: number;
  isOpen?: boolean;
  onClose?: () => void;
  onItemPress?: (item: VocabularyItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function VocabItemsDrawer({
  setId,
  isOpen = true,
  onClose,
  onItemPress,
}: VocabItemsDrawerProps) {
  const insets = useSafeAreaInsets();
  const set = MOCK_VOCAB_SETS.find((s) => s.id === setId);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, slideAnim]);

  const handleItemPress = (item: VocabularyItem) => {
    onItemPress?.(item);
  };

  const drawerWidth = Math.min(SCREEN_WIDTH * 0.85, 400);

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop */}
      {isOpen && (
        <Pressable
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
        />
      )}

      {/* Drawer Content */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: drawerWidth,
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="bg-background border-l border-border"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
          <View>
            <Text className="text-xl font-semibold">{set?.title || 'Vocab Items'}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {set ? `${set.learnedCount}/${set.itemCount} learned` : '0 items'}
            </Text>
          </View>
          <Button variant="ghost" size="icon" onPress={onClose} className="-mr-2">
            <Icon as={X} size={24} className="text-foreground" />
          </Button>
        </View>

        {/* Set Description */}
        {set && (
          <View className="px-5 py-3 border-b border-border">
            <Text className="text-sm text-muted-foreground">{set.description}</Text>
          </View>
        )}

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-2">
          <View className="gap-3">
            {MOCK_DATA.map((item) => (
              <VocabItem
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item)}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
