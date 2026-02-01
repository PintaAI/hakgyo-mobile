import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the base URL for the API based on the environment
 * - Development: localhost for Android emulator (10.0.2.2) or iOS simulator
 * - Production/Preview: https://hakgyo.vercel.app/
 */
export function getBaseUrl(): string {
  const isDev = __DEV__;

  if (isDev) {
    // For Android emulator, use 10.0.2.2 to access host's localhost
    // For iOS simulator, localhost works directly
    if (Platform.OS === 'android') {
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
