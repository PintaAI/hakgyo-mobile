import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Flame, Trophy, Star } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import type { DailyLoginData } from '@/hooks/use-daily-login';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export interface DailyLoginPopupProps {
  visible: boolean;
  onClose: () => void;
  data: DailyLoginData;
}

export function DailyLoginPopup({
  visible,
  onClose,
  data,
}: DailyLoginPopupProps) {
  const { xpGained, currentStreak, streakMilestoneReached, level } = data;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
    }
  }, [visible]);

  const handleClose = () => {
    setShowContent(false);
    // Allow animation to complete before closing
    setTimeout(onClose, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <AnimatedView
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 bg-black/50 items-center justify-center p-6"
      >
        <AnimatedPressable
          onPress={handleClose}
          className="absolute inset-0"
        />

        {showContent && (
          <AnimatedView
            entering={ZoomIn.duration(300).springify()}
            exiting={ZoomOut.duration(200)}
            className="w-full max-w-sm"
          >
            <Card className="bg-card border-2 border-primary/20 shadow-2xl">
              <CardHeader className="items-center pb-4">
                <AnimatedView
                  entering={FadeIn.duration(400).delay(100)}
                  className="bg-primary/20 rounded-full p-4 mb-3"
                >
                  <Icon as={Flame} size={48} className="text-primary" />
                </AnimatedView>
                <CardTitle className="text-2xl text-center">
                  Welcome Back!
                </CardTitle>
              </CardHeader>

              <CardContent className="gap-4">
                {/* XP Gained */}
                <AnimatedView
                  entering={FadeIn.duration(400).delay(200)}
                  className="bg-secondary/30 rounded-lg p-4 flex-row items-center justify-center gap-3"
                >
                  <Icon as={Star} size={24} className="text-yellow-500" />
                  <View>
                    <Text className="text-sm text-muted-foreground">
                      Daily Bonus
                    </Text>
                    <Text className="text-xl font-bold text-foreground">
                      +{xpGained} XP
                    </Text>
                  </View>
                </AnimatedView>

                {/* Streak Information */}
                <AnimatedView
                  entering={FadeIn.duration(400).delay(300)}
                  className="bg-orange-500/10 rounded-lg p-4 flex-row items-center justify-center gap-3"
                >
                  <Icon as={Flame} size={24} className="text-orange-500" />
                  <View>
                    <Text className="text-sm text-muted-foreground">
                      Current Streak
                    </Text>
                    <Text className="text-xl font-bold text-foreground">
                      {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </AnimatedView>

                {/* Streak Milestone */}
                {streakMilestoneReached && (
                  <AnimatedView
                    entering={FadeIn.duration(400).delay(400)}
                    className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex-row items-center justify-center gap-3"
                  >
                    <Icon as={Trophy} size={24} className="text-primary" />
                    <View>
                      <Text className="text-sm font-medium text-primary">
                        Milestone Reached!
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {currentStreak} day streak achieved!
                      </Text>
                    </View>
                  </AnimatedView>
                )}

                {/* Level Information */}
                {level !== undefined && (
                  <AnimatedView
                    entering={FadeIn.duration(400).delay(500)}
                    className="text-center"
                  >
                    <Text className="text-sm text-muted-foreground">
                      Current Level: <Text className="font-semibold text-foreground">{level}</Text>
                    </Text>
                  </AnimatedView>
                )}

                {/* Close Button */}
                <AnimatedView
                  entering={FadeIn.duration(400).delay(600)}
                  className="pt-2"
                >
                  <Button
                    onPress={handleClose}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    <Text>Continue Learning</Text>
                  </Button>
                </AnimatedView>
              </CardContent>
            </Card>
          </AnimatedView>
        )}
      </AnimatedView>
    </Modal>
  );
}
