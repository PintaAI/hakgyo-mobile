import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { BookOpen, Gamepad2 } from 'lucide-react-native';
import { MOCK_DATA } from '@/data/mock-vocabulary';
import { VocabList, VocabGame } from '@/components/vocab';

type Tab = 'list' | 'game';

export default function VocabScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('list');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-semibold">Kosakata</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {MOCK_DATA.length} kata tersedia
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row p-2 gap-2">
          <Button
            variant={activeTab === 'list' ? 'default' : 'outline'}
            className="flex-1"
            onPress={() => setActiveTab('list')}
          >
            <Icon as={BookOpen} size={18} className={activeTab === 'list' ? 'text-primary-foreground' : 'text-foreground'} />
            <Text className={activeTab === 'list' ? 'text-primary-foreground' : 'text-foreground'}>Daftar</Text>
          </Button>
          <Button
            variant={activeTab === 'game' ? 'default' : 'outline'}
            className="flex-1"
            onPress={() => setActiveTab('game')}
          >
            <Icon as={Gamepad2} size={18} className={activeTab === 'game' ? 'text-primary-foreground' : 'text-foreground'} />
            <Text className={activeTab === 'game' ? 'text-primary-foreground' : 'text-foreground'}>Game</Text>
          </Button>
        </View>

        {/* Content */}
        <ScrollView className="flex-1">
          {activeTab === 'list' ? <VocabList vocabulary={MOCK_DATA} /> : <VocabGame vocabulary={MOCK_DATA} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
