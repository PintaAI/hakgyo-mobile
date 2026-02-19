import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { Progress } from '@/components/ui/progress';
import { FileText, CheckCircle, TrendingUp, User, ChevronRight, Calendar } from 'lucide-react-native';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';

export interface SoalSet {
  id: number;
  nama: string;
  deskripsi?: string;
  icon?: string;
  isPrivate: boolean;
  isDraft: boolean;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  soals?: unknown[];
  kelasKoleksiSoals?: unknown[];
  _count?: {
    soals: number;
  };
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface SoalSetProps {
  set: SoalSet;
  onPress?: () => void;
}

export function SoalSet({ set, onPress }: SoalSetProps) {
  const { colorScheme } = useColorScheme();
  const itemCount = set._count?.soals ?? 0;
  const completedCount = set.completedCount ?? 0;
  const progress = itemCount > 0 ? (completedCount / itemCount) * 100 : 0;
  const isCompleted = progress === 100;
  const theme = THEME[colorScheme ?? 'light'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Card className="border-border/50 shadow-md shadow-black">
        <CardContent>
          {/* Top Section - Icon & Title */}
          <View className="flex-row items-center gap-3 pb-3">
            {/* Icon Container */}
            {set.icon ? (
              <View className="w-12 h-12 items-center justify-center rounded overflow-hidden ">
                <LinearGradient
                  colors={[colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-full h-full items-center justify-center"
                >
                  <IconRenderer iconName={set.icon} size={22} className="text-primary" />
                </LinearGradient>
              </View>
            ) : (
              <View className="w-12 h-12 items-center justify-center rounded overflow-hidden">
                <LinearGradient
                  colors={[colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-full h-full items-center justify-center"
                >
                  <Icon as={FileText} size={22} className="text-muted-foreground" />
                </LinearGradient>
              </View>
            )}

            {/* Title & Description */}
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-semibold text-foreground leading-tight" numberOfLines={1}>
                {set.nama}
              </Text>
              {set.deskripsi && (
                <Text className="text-sm text-muted-foreground leading-tight" numberOfLines={1} ellipsizeMode="tail">
                  {set.deskripsi}
                </Text>
              )}
            </View>

            {/* Chevron */}
            <Icon as={ChevronRight} size={20} className="text-muted-foreground/50 mt-0.5" />
          </View>

          {/* Stats Row */}
          {itemCount > 0 && (
            <View className="flex-row items-center gap-4 pb-2">
              <View className="flex-row items-center gap-1.5">
                <Icon as={FileText} size={14} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'soal' : 'soal'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Icon as={Calendar} size={14} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  {formatDate(set.createdAt)}
                </Text>
              </View>
              {set.user && (
                <View className="flex-row items-center gap-1.5">
                  <Icon as={User} size={14} className="text-muted-foreground" />
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {set.user.name}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center gap-1.5 ml-auto">
                <Icon as={CheckCircle} size={14} className={isCompleted ? "text-success" : "text-muted-foreground"} />
                <Text className="text-xs text-muted-foreground">
                  {completedCount} selesai
                </Text>
              </View>
            </View>
          )}

          {/* Progress Section */}
          {itemCount > 0 && (
            <View>
              <Progress value={progress} className="h-1.5 bg-muted/60" indicatorClassName={isCompleted ? 'bg-success' : 'bg-primary'} />

              {/* Progress Text */}
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs text-muted-foreground">
                  {progress.toFixed(0)}% selesai
                </Text>
                {isCompleted ? (
                  <View className="flex-row items-center gap-1">
                    <Icon as={CheckCircle} size={12} className="text-success" />
                    <Text className="text-xs text-success font-medium">Selesai</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1">
                    <Icon as={TrendingUp} size={12} className="text-primary" />
                    <Text className="text-xs text-primary font-medium">
                      {itemCount - completedCount} tersisa
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Empty State */}
          {itemCount === 0 && (
            <View className="pb-4 pt-1">
              <Text className="text-xs text-muted-foreground">Buka untuk melihat soal</Text>
            </View>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}
