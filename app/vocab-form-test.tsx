import React, { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/ui/background';
import { VocabSetForm, VocabItemForm } from '@/components/vocab';
import { useAuth } from 'hakgyo-expo-sdk';
import { Plus, BookOpen, FileText } from 'lucide-react-native';
import type { VocabularySet, VocabularyItem } from 'hakgyo-expo-sdk';

export default function VocabFormTestScreen() {
  const { user } = useAuth();
  const [isSetFormOpen, setIsSetFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [createdSet, setCreatedSet] = useState<VocabularySet | null>(null);
  const [createdItems, setCreatedItems] = useState<VocabularyItem[]>([]);

  const handleSetCreated = (set: VocabularySet) => {
    setCreatedSet(set);
    console.log('Created vocabulary set:', set);
  };

  const handleItemCreated = (item: VocabularyItem) => {
    setCreatedItems([...createdItems, item]);
    console.log('Created vocabulary item:', item);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Background />
      <ScrollView
        className="flex-1"
        contentContainerClassName={`p-4 gap-6 ${Platform.OS === 'android' ? 'pb-24' : 'pb-24'}`}
      >
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-foreground">Vocab Forms Test</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Test the vocabulary set and item forms
          </Text>
        </View>

        {/* Test Actions */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Test Actions</Text>

          <Button
            onPress={() => setIsSetFormOpen(true)}
            className="w-full flex-row gap-2"
          >
            <Icon as={Plus} size={20} className="text-primary-foreground" />
            <Icon as={BookOpen} size={20} className="text-primary-foreground" />
            <Text>Create Vocab Set</Text>
          </Button>

          <Button
            onPress={() => setIsItemFormOpen(true)}
            variant="outline"
            className="w-full flex-row gap-2"
          >
            <Icon as={Plus} size={20} className="text-foreground" />
            <Icon as={FileText} size={20} className="text-foreground" />
            <Text>Add Vocab Item</Text>
          </Button>
        </View>

        {/* Created Set Info */}
        {createdSet && (
          <Card className="border-border/50">
            <CardContent className="p-4 gap-3">
              <Text className="text-sm font-semibold text-foreground">Created Set</Text>
              <View className="gap-1">
                <Text className="text-base font-medium text-foreground">{createdSet.title}</Text>
                {createdSet.description && (
                  <Text className="text-sm text-muted-foreground">{createdSet.description}</Text>
                )}
                <View className="flex-row gap-2 mt-2">
                  <View className="bg-primary/10 px-2 py-1 rounded">
                    <Text className="text-xs text-primary">
                      ID: {createdSet.id}
                    </Text>
                  </View>
                  <View className="bg-muted px-2 py-1 rounded">
                    <Text className="text-xs text-muted-foreground">
                      {createdSet.isPublic ? 'Public' : 'Private'}
                    </Text>
                  </View>
                  <View className="bg-muted px-2 py-1 rounded">
                    <Text className="text-xs text-muted-foreground">
                      {createdSet.isDraft ? 'Draft' : 'Published'}
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Created Items Info */}
        {createdItems.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">Created Items</Text>
                <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-medium text-primary">{createdItems.length}</Text>
                </View>
              </View>
              <View className="gap-2">
                {createdItems.map((item, index) => (
                  <View key={item.id} className="bg-muted/30 p-3 rounded-lg gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs text-muted-foreground">#{index + 1}</Text>
                      <Text className="text-sm font-medium text-foreground">{item.korean}</Text>
                    </View>
                    <Text className="text-sm text-muted-foreground ml-5">{item.indonesian}</Text>
                    <View className="flex-row gap-2 mt-1 ml-5">
                      <View className="bg-primary/10 px-2 py-0.5 rounded">
                        <Text className="text-[10px] text-primary">{item.type}</Text>
                      </View>
                      {item.pos && (
                        <View className="bg-muted px-2 py-0.5 rounded">
                          <Text className="text-[10px] text-muted-foreground">{item.pos}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* User Info */}
        {user && (
          <Card className="border-border/50">
            <CardContent className="p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">Current User</Text>
              <Text className="text-sm text-foreground">{user.email}</Text>
              <Text className="text-xs text-muted-foreground">ID: {user.id}</Text>
              <Text className="text-xs text-muted-foreground">Level: {user.level}</Text>
              <Text className="text-xs text-muted-foreground">XP: {user.xp}</Text>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-border/50">
          <CardContent className="p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">Instructions</Text>
            <Text className="text-xs text-muted-foreground">
              1. Tap "Create Vocab Set" to test the vocabulary set form
            </Text>
            <Text className="text-xs text-muted-foreground">
              2. Tap "Add Vocab Item" to test the vocabulary item form
            </Text>
            <Text className="text-xs text-muted-foreground">
              3. Created items will be displayed below
            </Text>
            <Text className="text-xs text-muted-foreground">
              Note: You need to be logged in to create vocabulary items
            </Text>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Vocab Set Form */}
      <VocabSetForm
        isOpen={isSetFormOpen}
        onClose={() => setIsSetFormOpen(false)}
        onSuccess={handleSetCreated}
        userId={user?.id}
        kelasId={undefined}
      />

      {/* Vocab Item Form */}
      <VocabItemForm
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        onSuccess={handleItemCreated}
        collectionId={createdSet?.id}
        editItem={null}
      />
    </SafeAreaView>
  );
}
