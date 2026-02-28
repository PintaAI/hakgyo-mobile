import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { Alert } from '@/components/ui/alert';
import { vocabularyApi } from 'hakgyo-expo-sdk';
import { AlertCircle, BookOpen, Globe, Lock, Save, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import type { VocabularySet as SDKVocabularySet } from 'hakgyo-expo-sdk';

// Common icon options for vocabulary sets
const ICON_OPTIONS = [
  'FaBook',
  'FaPen',
  'FaGraduationCap',
  'FaLanguage',
  'FaLightbulb',
  'FaStar',
  'FaHeart',
  'FaMusic',
  'FaUtensils',
  'FaHome',
  'FaCar',
  'FaShoppingBag',
  'FaBriefcase',
  'FaPlane',
  'FaGamepad',
  'FaFilm',
  'FaCamera',
  'FaPhone',
  'FaEnvelope',
  'FaCalendar',
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface VocabSetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (set: SDKVocabularySet) => void;
  editSet?: SDKVocabularySet | null;
  userId?: string;
  kelasId?: number;
}

export function VocabSetForm({
  isOpen,
  onClose,
  onSuccess,
  editSet,
  userId,
  kelasId,
}: VocabSetFormProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or editSet changes
  useEffect(() => {
    if (isOpen) {
      if (editSet) {
        setTitle(editSet.title);
        setDescription(editSet.description || '');
        setIcon(editSet.icon);
        setIsPublic(editSet.isPublic);
        setIsDraft(editSet.isDraft);
      } else {
        setTitle('');
        setDescription('');
        setIcon(undefined);
        setIsPublic(false);
        setIsDraft(true);
      }
      setError(null);
    }
  }, [isOpen, editSet]);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        icon,
        isPublic,
        isDraft,
        userId,
        kelasId,
      };

      // Note: SDK doesn't have updateSet method yet, so edit mode is not supported
      // Only create mode is available
      if (editSet) {
        setError('Editing vocabulary sets is not supported yet. Please create a new set.');
        return;
      }

      const response = await vocabularyApi.createSet(data);

      if (response.success && response.data) {
        onSuccess?.(response.data);
        onClose();
      } else {
        setError(response.error || 'Failed to save vocabulary set');
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
      console.error('Error saving vocab set:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle='overFullScreen'
      
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
                  {editSet ? 'Edit Vocabulary Set' : 'Create Vocabulary Set'}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {editSet ? 'Update your vocabulary set details.' : 'Create a new vocabulary set to organize your words.'}
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

                {/* Title Input */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Title *</Text>
                  <Input
                    placeholder="e.g., Basic Korean Verbs"
                    value={title}
                    onChangeText={setTitle}
                    editable={!loading}
                  />
                </View>

                {/* Description Input */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Description</Text>
                  <Input
                    placeholder="Brief description of this vocabulary set"
                    value={description}
                    onChangeText={setDescription}
                    editable={!loading}
                    multiline
                    numberOfLines={3}
                    className="min-h-[80px]"
                  />
                </View>

                {/* Icon Selection */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">Icon</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Button
                      variant={icon === undefined ? 'default' : 'outline'}
                      size="sm"
                      onPress={() => setIcon(undefined)}
                      disabled={loading}
                      className="h-10 px-3"
                    >
                      <Icon as={BookOpen} size={16} className="text-foreground" />
                    </Button>
                    {ICON_OPTIONS.map((iconName) => (
                      <Button
                        key={iconName}
                        variant={icon === iconName ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setIcon(iconName)}
                        disabled={loading}
                        className="h-10 px-3"
                      >
                        <IconRenderer iconName={iconName} size={16} className="text-foreground" />
                      </Button>
                    ))}
                  </View>
                </View>

                {/* Visibility Toggle */}
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center gap-2">
                          <Icon as={isPublic ? Globe : Lock} size={18} className="text-primary" />
                          <Text className="text-sm font-medium text-foreground">
                            {isPublic ? 'Public Set' : 'Private Set'}
                          </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground mt-1">
                          {isPublic
                            ? 'Anyone can view and use this vocabulary set'
                            : 'Only you can see this vocabulary set'}
                        </Text>
                      </View>
                      <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        disabled={loading}
                      />
                    </View>
                  </CardContent>
                </Card>

                {/* Draft Toggle */}
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-sm font-medium text-foreground">
                          {isDraft ? 'Draft' : 'Published'}
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-1">
                          {isDraft
                            ? 'Save as draft - not visible to others'
                            : 'Publish - visible to others (if public)'}
                        </Text>
                      </View>
                      <Switch
                        checked={!isDraft}
                        onCheckedChange={(checked) => setIsDraft(!checked)}
                        disabled={loading}
                      />
                    </View>
                  </CardContent>
                </Card>
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
                  <Text>Create</Text>
                </View>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
