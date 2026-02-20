import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Volume2,
  MessageSquare,
  CheckCircle,
  Circle,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vocabularyApi, type VocabularyItem } from 'hakgyo-expo-sdk';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';

interface VocabItemBottomSheetProps {
  item: VocabularyItem;
  onClose?: () => void;
  onAudioPress?: () => void;
  onShare?: () => void;
  isLearned?: boolean;
  onLearnedToggle?: (itemId: number, isLearned: boolean) => void;
}

const TYPE_LABELS = {
  WORD: 'Word',
  SENTENCE: 'Sentence',
  IDIOM: 'Idiom',
} as const;

const TYPE_COLORS = {
  WORD: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  SENTENCE: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  IDIOM: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
} as const;

const POS_LABELS = {
  KATA_KERJA: 'Verb',
  KATA_BENDA: 'Noun',
  KATA_SIFAT: 'Adjective',
  KATA_KETERANGAN: 'Adverb',
} as const;

export function VocabItemBottomSheet({
  item,
  onClose,
  onAudioPress,
  isLearned = false,
  onLearnedToggle,
}: VocabItemBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [localIsLearned, setLocalIsLearned] = useState(isLearned);

  // Handle toggle learned status (optimistic UI)
  const handleToggleLearned = useCallback(async () => {
    const newStatus = !localIsLearned;
    
    // Optimistic update - update UI immediately
    setLocalIsLearned(newStatus);
    onLearnedToggle?.(item.id, newStatus);
    
    try {
      await vocabularyApi.setLearnedStatus(item.id, newStatus);
    } catch (error) {
      console.error('Failed to toggle learned status:', error);
      // Revert on error
      setLocalIsLearned(!newStatus);
      onLearnedToggle?.(item.id, !newStatus);
    }
  }, [item.id, localIsLearned, onLearnedToggle]);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => [ '90%'], []);

  // Callback to handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose?.();
    }
  }, [onClose]);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: NAV_THEME[colorScheme ?? 'light'].colors.card,
      }}
      handleIndicatorStyle={{
        backgroundColor: NAV_THEME[colorScheme ?? 'light'].colors.text,
        opacity: 0.2,
      }}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>

        {/* Main Content */}
        <View className="px-6 pt-2 pb-6 gap-6">
          {/* Top Actions & Metadata */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Badge variant="secondary" className="px-2.5">
                <Text className="text-xs font-medium">{TYPE_LABELS[item.type]}</Text>
              </Badge>
              {item.pos && (
                <Badge variant="outline" className="px-2.5">
                  <Text className="text-xs text-muted-foreground font-medium">
                    {POS_LABELS[item.pos] || item.pos.replace(/_/g, ' ')}
                  </Text>
                </Badge>
              )}
            </View>
            <View className="flex-row gap-1">
              {/* Learned Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onPress={handleToggleLearned}
                className="rounded-full"
              >
                {localIsLearned ? (
                  <Icon as={CheckCircle} size={24} className="text-green-600" />
                ) : (
                  <Icon as={Circle} size={24} className="text-muted-foreground" />
                )}
              </Button>
              {item.audioUrl && onAudioPress && (
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={onAudioPress}
                  className="rounded-full hover:bg-muted"
                >
                  <Icon as={Volume2} size={22} className="text-primary" />
                </Button>
              )}
            </View>
          </View>

          {/* Vocabulary Hero */}
          <View className="gap-2">
            <Text className="text-4xl font-bold text-foreground tracking-tight">
              {item.korean}
            </Text>
            <Text className="text-2xl text-muted-foreground font-medium">
              {item.indonesian}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-border/50" />

          {/* Example Sentences */}
          {item.exampleSentences && item.exampleSentences.length > 0 && (
            <View className="gap-4">
              <View className="flex-row items-center gap-2">
                <Icon as={MessageSquare} size={18} className="text-primary" />
                <Text className="text-base font-semibold text-foreground">
                  Contoh Kalimat
                </Text>
              </View>
              <View className="gap-3">
                {item.exampleSentences.map((sentence, index) => (
                  <View
                    key={index}
                    className="bg-muted/30 rounded-xl p-4 border border-border/50"
                  >
                    <Text className="text-base leading-relaxed text-foreground/90">
                      {sentence}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
