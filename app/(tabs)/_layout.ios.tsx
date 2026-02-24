import { Redirect } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useAuth } from 'hakgyo-expo-sdk';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DynamicColorIOS } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  const { session, loading } = auth as any;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  // Liquid glass colors that adapt to light/dark mode
  const tintColor = DynamicColorIOS({
    dark: '#FFFFFF',
    light: '#000000',
  });

  const textColor = DynamicColorIOS({
    dark: '#FFFFFF',
    light: '#000000',
  });

  return (
    <NativeTabs
      tintColor={tintColor}
      labelStyle={{
        color: textColor,
      }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="vocab">
        <Icon sf={{ default: 'book', selected: 'book.fill' }} />
        <Label>Vocab</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="soal">
        <Icon sf={{ default: 'questionmark.circle', selected: 'questionmark.circle.fill' }} />
        <Label>Soal</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
