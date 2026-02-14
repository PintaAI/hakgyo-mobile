import { View, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { AuthCard } from '@/components/auth';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useAuth } from 'hakgyo-expo-sdk';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthScreen() {
  const auth = useAuth();
  const { session, isLoading } = auth as any;
  const keyboard = useAnimatedKeyboard();
  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <View className="flex-1">
            <AuthCard />
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </>
  );
}
