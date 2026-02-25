import { Extrapolation } from 'react-native-reanimated';

export const SCREEN_WIDTH = 300;
export const SWIPE_THRESHOLD = 150;

/**
 * Format part of speech string for display
 * Converts "NOUN" to "Noun", "VERB_PAST" to "Verb Past", etc.
 */
export const formatPos = (pos?: string): string =>
  pos?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';

/**
 * Interpolate scale based on translation value
 * Used for background card scaling effect
 */
export const interpolateScale = (translation: number): number => {
  'worklet';
  return Math.max(
    0.9,
    Math.min(
      1,
      0.9 + (Math.abs(translation) / (SCREEN_WIDTH / 2)) * 0.1
    )
  );
};
