import { StyleSheet } from 'react-native';

export const dailyVocabularyStyles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardInactive: {
    top: 0,
    left: 0,
  },
  cardStack: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  wordCountBadge: {
    position: 'absolute',
    top: -35,
    right: 8,
    zIndex: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintText: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    zIndex: 25,
    alignItems: 'center',
  },
  refreshingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  progressBadge: {
    position: 'absolute',
    top: 5,
    left: '50%',
    transform: [{ translateX: -25 }],
    zIndex: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
