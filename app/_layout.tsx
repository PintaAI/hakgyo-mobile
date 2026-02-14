import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { sdkConfig } from '@/lib/config';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { initSDK, AuthProvider } from 'hakgyo-expo-sdk';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UpdateChecker } from '@/components/update-checker';
import * as SplashScreen from 'expo-splash-screen';

// Initialize the SDK with dynamic configuration
initSDK(sdkConfig);

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <AuthProvider>
          <UpdateChecker />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
