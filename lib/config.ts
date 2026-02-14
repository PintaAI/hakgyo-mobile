import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the base URL for the API based on the environment
 * - Development:
 *   - For Android emulator: 10.0.2.2
 *   - For real Android device (WiFi): Host IP address (e.g. 192.168.x.x or 100.x.x.x)
 *   - For iOS simulator: localhost
 * - Production/Preview: https://hakgyo.vercel.app/
 */
export function getBaseUrl(): string {
  const isDev = __DEV__;

  if (isDev) {
    // 1. Prioritize environment variable if set (works for both real device & emulator if configured)
    const devServerIp = process.env.EXPO_PUBLIC_DEV_SERVER_IP || process.env.DEV_SERVER_IP;
    if (devServerIp) {
       // Ensure protocol is present
       const url = devServerIp.startsWith('http') ? devServerIp : `http://${devServerIp}:3000`;
       console.log('[Config] Using custom DEV_SERVER_IP:', url);
       return url;
    }

    // 2. Try to infer from Expo manifest (debuggerHost) - this is the most reliable for WiFi debugging
    // debuggerHost usually looks like "192.168.1.5:8081"
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      const url = `http://${ip}:3000`; // Assuming backend is on port 3000
      console.log('[Config] Inferred host IP from Expo debuggerHost:', url);
      return url;
    }

    // 3. Fallbacks for specific environments
    if (Platform.OS === 'android') {
        // If we can't find the IP, 10.0.2.2 is the safe default for Emulators.
        // For real devices without the IP logic above, this will fail.
        return 'http://10.0.2.2:3000';
    }

    // iOS simulator or web dev
    return 'http://localhost:3000';
  }

  // Production or preview
  return 'https://hakgyo.vercel.app';
}

/**
 * Get the deep link scheme for auth redirects
 */
export function getDeepLinkScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  if (typeof scheme === 'string') {
    return scheme;
  }
  if (Array.isArray(scheme) && scheme.length > 0) {
    return scheme[0];
  }
  return 'hakgyo';
}

/**
 * SDK configuration
 */
export const sdkConfig = {
  baseURL: getBaseUrl(),
  auth: {
    deepLinkScheme: getDeepLinkScheme(),
    autoRefresh: true,
    sessionRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },
  logging: {
    enabled: __DEV__,
    level: __DEV__ ? 'debug' : 'error',
  },
  platform: {
    platformType: Platform.OS as 'ios' | 'android' | 'web',
  },
} as const;
