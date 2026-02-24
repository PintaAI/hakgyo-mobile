import { Tabs, Redirect } from 'expo-router';
import { Home, User, BookOpen, HelpCircle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { THEME } from '@/lib/theme';
import { useAuth } from 'hakgyo-expo-sdk';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Text } from 'react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const auth = useAuth();
  const { session, loading } = auth as any;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  const TabIcon = ({ focused, label, children }: { focused: boolean; label: string; children: React.ReactNode }) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 27,
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: focused ? theme.primary + '15' : 'transparent',
        minWidth: 90,
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {children}
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          fontWeight: focused ? '600' : '400',
          color: focused ? theme.secondary : theme.mutedForeground,
          textAlign: 'center',
          includeFontPadding: false,
        }}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 2,
          borderWidth: 2,
          borderRadius: 40,
          marginHorizontal: 16,
          marginBottom: 16,
          paddingHorizontal: 8,
          paddingVertical: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 5,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarItemStyle: {
          borderRadius: 30,
          marginHorizontal: 4,
          paddingVertical: 13.5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
          
        },
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} label="Home">
              <Home size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'Vocab',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} label="Vocab">
              <BookOpen size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="soal"
        options={{
          title: 'Soal',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} label="Soal">
              <HelpCircle size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} label="Profile">
              <User size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

