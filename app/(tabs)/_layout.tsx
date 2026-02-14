import { Tabs, Redirect } from 'expo-router';
import { Home, User, BookOpen, HelpCircle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@/lib/theme';
import { useAuth } from 'hakgyo-expo-sdk';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const { session, isLoading } = auth as any;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: 5 + insets.bottom,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'Vocab',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="soal"
        options={{
          title: 'Soal',
          tabBarIcon: ({ color, size }) => <HelpCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
