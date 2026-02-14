import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

export function LoadingSpinner() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}
