import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';

type ColorItem = {
  name: string;
  bgClass: string;
  textClass: string;
};

const colorCategories: { title: string; colors: ColorItem[] }[] = [
  {
    title: 'Base Colors',
    colors: [
      { name: 'Background', bgClass: 'bg-background', textClass: 'text-foreground' },
      { name: 'Foreground', bgClass: 'bg-foreground', textClass: 'text-background' },
      { name: 'Card', bgClass: 'bg-card', textClass: 'text-card-foreground' },
      { name: 'Popover', bgClass: 'bg-popover', textClass: 'text-popover-foreground' },
    ],
  },
  {
    title: 'Primary & Secondary',
    colors: [
      { name: 'Primary', bgClass: 'bg-primary', textClass: 'text-primary-foreground' },
      { name: 'Secondary', bgClass: 'bg-secondary', textClass: 'text-secondary-foreground' },
    ],
  },
  {
    title: 'Muted & Accent',
    colors: [
      { name: 'Muted', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
      { name: 'Accent', bgClass: 'bg-accent', textClass: 'text-accent-foreground' },
    ],
  },
  {
    title: 'Status Colors',
    colors: [
      { name: 'Destructive', bgClass: 'bg-destructive', textClass: 'text-destructive-foreground' },
      { name: 'Success', bgClass: 'bg-success', textClass: 'text-success-foreground' },
      { name: 'Fail', bgClass: 'bg-fail', textClass: 'text-fail-foreground' },
    ],
  },
  {
    title: 'Border & Input',
    colors: [
      { name: 'Border', bgClass: 'bg-border', textClass: 'text-foreground' },
      { name: 'Input', bgClass: 'bg-input', textClass: 'text-foreground' },
      { name: 'Ring', bgClass: 'bg-ring', textClass: 'text-background' },
    ],
  },
  {
    title: 'Chart Colors',
    colors: [
      { name: 'Chart 1', bgClass: 'bg-chart-1', textClass: 'text-background' },
      { name: 'Chart 2', bgClass: 'bg-chart-2', textClass: 'text-background' },
      { name: 'Chart 3', bgClass: 'bg-chart-3', textClass: 'text-foreground' },
      { name: 'Chart 4', bgClass: 'bg-chart-4', textClass: 'text-foreground' },
      { name: 'Chart 5', bgClass: 'bg-chart-5', textClass: 'text-background' },
    ],
  },
  {
    title: 'Sidebar Colors',
    colors: [
      { name: 'Sidebar', bgClass: 'bg-sidebar', textClass: 'text-sidebar-foreground' },
      { name: 'Sidebar Primary', bgClass: 'bg-sidebar-primary', textClass: 'text-sidebar-primary-foreground' },
      { name: 'Sidebar Accent', bgClass: 'bg-sidebar-accent', textClass: 'text-sidebar-accent-foreground' },
      { name: 'Sidebar Border', bgClass: 'bg-sidebar-border', textClass: 'text-foreground' },
      { name: 'Sidebar Ring', bgClass: 'bg-sidebar-ring', textClass: 'text-background' },
    ],
  },
];

function ColorSwatch({ color }: { color: ColorItem }) {
  return (
    <View className="flex-col items-center gap-2">
      <View className={`h-20 w-20 rounded-lg ${color.bgClass} items-center justify-center border border-border`}>
        <Text className={`text-sm font-medium ${color.textClass}`}>
          Text
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">{color.name}</Text>
    </View>
  );
}

export default function ColorTestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="p-6 gap-6">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Icon as={ChevronLeft} size={24} className="text-foreground" />
          </Button>
          <Text className="text-2xl font-bold text-foreground">Color Test</Text>
        </View>

        {/* Description */}
        <Card>
          <CardContent className="pt-6">
            <Text className="text-sm text-muted-foreground">
              This screen displays all color tokens from the theme to verify they work correctly in both light and dark mode.
            </Text>
          </CardContent>
        </Card>

        {/* Color Categories */}
        {colorCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap gap-4">
                {category.colors.map((color) => (
                  <ColorSwatch key={color.name} color={color} />
                ))}
              </View>
            </CardContent>
          </Card>
        ))}

        {/* Back to Profile Button */}
        <Button
          variant="outline"
          onPress={() => router.push('/(tabs)/profile')}
          className="w-full"
        >
          <Text>Back to Profile</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
