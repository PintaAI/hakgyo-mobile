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

// Initialize the SDK with dynamic configuration
initSDK(sdkConfig);

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
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
