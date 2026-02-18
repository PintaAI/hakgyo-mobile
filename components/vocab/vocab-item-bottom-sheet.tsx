import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Check,
  Volume2,
  BookOpen,
  MessageSquare,
  Quote,
  Share2,
  X,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { VocabularyItem } from '@/data/mock-vocabulary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VocabItemBottomSheetProps {
  item: VocabularyItem;
  onClose?: () => void;
  onAudioPress?: () => void;
  onShare?: () => void;
}

const TYPE_ICONS = {
  WORD: BookOpen,
  SENTENCE: MessageSquare,
  IDIOM: Quote,
} as const;

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
  onShare,
}: VocabItemBottomSheetProps) {
  const insets = useSafeAreaInsets();

  const TypeIcon = TYPE_ICONS[item.type];
  const typeColor = TYPE_COLORS[item.type];

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['60%', '90%'], []);

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
      backgroundStyle={{ backgroundColor: 'hsl(var(--background))' }}
      handleIndicatorStyle={{ backgroundColor: 'hsl(var(--muted-foreground))' }}
      style={{ paddingHorizontal: 16 }}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-2 py-3 border-b border-border">
          <View className="flex-1" />
          <Button variant="ghost" size="icon" onPress={onClose} className="-mr-2">
            <Icon as={X} size={24} className="text-foreground" />
          </Button>
        </View>

        {/* Main Content */}
        <View className="gap-4">
          {/* Main Card */}
          <Card className="border-primary/30">
            <CardHeader>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  {item.isLearned && (
                    <View className="flex-row items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                      <Icon as={Check} size={14} className="text-green-500" />
                      <Text className="text-xs text-green-600 font-medium">Learned</Text>
                    </View>
                  )}
                  <Badge className={typeColor}>
                    <View className="flex-row items-center gap-1">
                      <Icon as={TypeIcon} size={12} />
                      <Text>{TYPE_LABELS[item.type]}</Text>
                    </View>
                  </Badge>
                </View>
                <View className="flex-row gap-2">
                  {onShare && (
                    <Button variant="ghost" size="icon" onPress={onShare}>
                      <Icon as={Share2} size={20} className="text-muted-foreground" />
                    </Button>
                  )}
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
              </View>
              <CardTitle className="text-3xl">{item.korean}</CardTitle>
              <CardDescription className="text-xl">{item.indonesian}</CardDescription>
            </CardHeader>
            {item.pos && (
              <CardContent>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-muted-foreground">Part of Speech:</Text>
                  <Badge variant="outline">
                    <Text>{POS_LABELS[item.pos] || item.pos.replace(/_/g, ' ')}</Text>
                  </Badge>
                </View>
              </CardContent>
            )}
          </Card>

          {/* Example Sentences */}
          {item.exampleSentences && item.exampleSentences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Example Sentences</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                {item.exampleSentences.map((sentence, index) => (
                  <View
                    key={index}
                    className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary"
                  >
                    <Text className="text-base">{sentence}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
