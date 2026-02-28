import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Alert } from '@/components/ui/alert';
import { vocabularyApi } from 'hakgyo-expo-sdk';
import { AlertCircle, Save, X, Plus, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import type { VocabularyItem as SDKVocabularyItem } from 'hakgyo-expo-sdk';

// Type options for vocabulary items
const TYPE_OPTIONS: Array<{ value: SDKVocabularyItem['type']; label: string }> = [
  { value: 'WORD', label: 'Word' },
  { value: 'SENTENCE', label: 'Sentence' },
  { value: 'IDIOM', label: 'Idiom' },
];

// Part of speech options for vocabulary items
const POS_OPTIONS: Array<{ value: SDKVocabularyItem['pos']; label: string }> = [
  { value: 'KATA_KERJA', label: 'Kata Kerja (Verb)' },
  { value: 'KATA_BENDA', label: 'Kata Benda (Noun)' },
  { value: 'KATA_SIFAT', label: 'Kata Sifat (Adjective)' },
  { value: 'KATA_KETERANGAN', label: 'Kata Keterangan (Adverb)' },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface VocabItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (item: SDKVocabularyItem) => void;
  editItem?: SDKVocabularyItem | null;
  collectionId?: number;
}

export function VocabItemForm({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  collectionId,
}: VocabItemFormProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [korean, setKorean] = useState('');
  const [indonesian, setIndonesian] = useState('');
  const [type, setType] = useState<SDKVocabularyItem['type']>('WORD');
  const [pos, setPos] = useState<SDKVocabularyItem['pos']>('KATA_KERJA');
  const [audioUrl, setAudioUrl] = useState('');
  const [exampleSentences, setExampleSentences] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setKorean(editItem.korean);
        setIndonesian(editItem.indonesian);
        setType(editItem.type);
        setPos(editItem.pos || 'KATA_KERJA');
        setAudioUrl(editItem.audioUrl || '');
        setExampleSentences(editItem.exampleSentences.length > 0 ? editItem.exampleSentences : ['']);
      } else {
        setKorean('');
        setIndonesian('');
        setType('WORD');
        setPos('KATA_KERJA');
        setAudioUrl('');
        setExampleSentences(['']);
      }
      setError(null);
    }
  }, [isOpen, editItem]);

  const handleAddExample = () => {
    setExampleSentences([...exampleSentences, '']);
  };

  const handleRemoveExample = (index: number) => {
    if (exampleSentences.length > 1) {
      const newSentences = exampleSentences.filter((_, i) => i !== index);
      setExampleSentences(newSentences);
    }
  };

  const handleExampleChange = (index: number, value: string) => {
    const newSentences = [...exampleSentences];
    newSentences[index] = value;
    setExampleSentences(newSentences);
  };

  const handleSubmit = async () => {
    // Validation
    if (!korean.trim()) {
      setError('Korean text is required');
      return;
    }
    if (!indonesian.trim()) {
      setError('Indonesian translation is required');
      return;
    }
    if (!collectionId && !editItem?.collectionId) {
      setError('Collection ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetCollectionId = collectionId || editItem?.collectionId;

      // Filter out empty example sentences
      const validExamples = exampleSentences
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (editItem) {
        // Update existing item
        const data = {
          korean: korean.trim(),
          indonesian: indonesian.trim(),
          type,
          pos,
          audioUrl: audioUrl.trim() || undefined,
          exampleSentences: validExamples,
        };

        const response = await vocabularyApi.updateItem(editItem.id, data);

        if (response.success && response.data) {
          onSuccess?.(response.data);
          onClose();
        } else {
          setError(response.error || 'Failed to update vocabulary item');
        }
      } else {
        // Create new item
        const data = {
          korean: korean.trim(),
          indonesian: indonesian.trim(),
          type,
          pos,
          audioUrl: audioUrl.trim() || undefined,
          exampleSentences: validExamples,
        };

        const response = await vocabularyApi.addItem(targetCollectionId!, data);

        if (response.success && response.data) {
          onSuccess?.(response.data);
          onClose();
        } else {
          setError(response.error || 'Failed to create vocabulary item');
        }
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
      console.error('Error saving vocab item:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ flex: 1 }}
        >
          {/* Backdrop */}
          <Pressable
            onPress={onClose}
            className="flex-1"
          />

          {/* Modal Content */}
          <View
            style={{
              backgroundColor: NAV_THEME[colorScheme ?? 'light'].colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: insets.bottom,
              maxHeight: SCREEN_HEIGHT * 0.9,
            }}
            className="border-t border-border"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <View>
                <Text className="text-lg font-bold text-foreground">
                  {editItem ? 'Edit Vocabulary Item' : 'Add Vocabulary Item'}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {editItem ? 'Update your vocabulary item details.' : 'Add a new word or phrase to your vocabulary set.'}
                </Text>
              </View>
              <Button
                variant="ghost"
                size="icon"
                onPress={onClose}
                className="h-8 w-8 rounded-full"
                disabled={loading}
              >
                <Icon as={X} size={20} className="text-foreground" />
              </Button>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-4 py-4">
              <View className="gap-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" icon={AlertCircle}>
                    <Text className="text-sm">{error}</Text>
                  </Alert>
                )}

                {/* Korean Input */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Korean *</Text>
                  <Input
                    placeholder="e.g., 안녕하세요"
                    value={korean}
                    onChangeText={setKorean}
                    editable={!loading}
                  />
                </View>

                {/* Indonesian Input */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Indonesian *</Text>
                  <Input
                    placeholder="e.g., Halo"
                    value={indonesian}
                    onChangeText={setIndonesian}
                    editable={!loading}
                  />
                </View>

                {/* Type Selection */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Type</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {TYPE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={type === option.value ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setType(option.value)}
                        disabled={loading}
                      >
                        <Text className="text-sm">{option.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                {/* Part of Speech Selection */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Part of Speech</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {POS_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={pos === option.value ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setPos(option.value)}
                        disabled={loading}
                        className="flex-1 min-w-[140px]"
                      >
                        <Text className="text-xs">{option.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                {/* Audio URL Input */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Audio URL (Optional)</Text>
                  <Input
                    placeholder="https://example.com/audio.mp3"
                    value={audioUrl}
                    onChangeText={setAudioUrl}
                    editable={!loading}
                  />
                </View>

                {/* Example Sentences */}
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-foreground">Example Sentences</Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={handleAddExample}
                      disabled={loading}
                      className="h-7 px-2"
                    >
                      <View className="flex-row items-center gap-1">
                        <Icon as={Plus} size={14} className="text-primary" />
                        <Text className="text-xs text-primary">Add</Text>
                      </View>
                    </Button>
                  </View>
                  <View className="gap-2">
                    {exampleSentences.map((example, index) => (
                      <View key={index} className="flex-row gap-2">
                        <Input
                          placeholder={`Example ${index + 1}`}
                          value={example}
                          onChangeText={(value) => handleExampleChange(index, value)}
                          editable={!loading}
                          className="flex-1"
                        />
                        {exampleSentences.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onPress={() => handleRemoveExample(index)}
                            disabled={loading}
                            className="h-10 w-10"
                          >
                            <Icon as={Trash2} size={16} className="text-destructive" />
                          </Button>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="flex-row gap-3 px-4 py-4 border-t border-border">
              <Button
                variant="outline"
                onPress={onClose}
                disabled={loading}
                className="flex-1"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Icon as={X} size={16} className="text-foreground" />
                  <Text>Cancel</Text>
                </View>
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Icon as={Save} size={16} className="text-primary-foreground" />
                  <Text>{editItem ? 'Update' : 'Add'}</Text>
                </View>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
