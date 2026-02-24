import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { User, ChevronRight, Clock, Calendar } from 'lucide-react-native';
import type { Tryout } from 'hakgyo-expo-sdk';

export interface TryoutCardProps {
  tryout: Tryout;
  onPress?: () => void;
}

export function TryoutCard({ tryout, onPress }: TryoutCardProps) {
  /** Returns a human-readable relative time string in Indonesian */
  const formatRelativeTime = (dateString: string): string => {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = date - now;
    const absDiff = Math.abs(diffMs);
    const isFuture = diffMs > 0;

    const minutes = Math.floor(absDiff / 60_000);
    const hours = Math.floor(absDiff / 3_600_000);
    const days = Math.floor(absDiff / 86_400_000);

    if (minutes < 1) return isFuture ? 'sebentar lagi' : 'baru saja';
    if (minutes < 60) return isFuture ? `${minutes} menit lagi` : `${minutes} menit yang lalu`;
    if (hours < 24) return isFuture ? `${hours} jam lagi` : `${hours} jam yang lalu`;
    return isFuture ? `${days} hari lagi` : `${days} hari yang lalu`;
  };

  /** Absolute fallback label shown as subtitle */
  const formatAbsoluteDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const getStatusBadge = () => {
    const now = new Date();
    const start = new Date(tryout.startTime);
    const end = new Date(tryout.endTime);

    if (!tryout.isActive) {
      return <Badge variant="secondary"><Text className="text-xs">Tidak Aktif</Text></Badge>;
    }

    if (now < start) {
      return <Badge variant="outline"><Text className="text-xs">Segera</Text></Badge>;
    }

    if (now > end) {
      return <Badge variant="secondary"><Text className="text-xs">Berakhir</Text></Badge>;
    }

    return <Badge variant="default"><Text className="text-xs text-primary-foreground">Aktif</Text></Badge>;
  };

  return (
    <Pressable onPress={() => {
      console.log('TryoutCard pressed with tryout.id:', tryout.id);
      onPress?.();
    }} className="active:scale-[0.98] transition-transform">
      <Card className="border-border bg-card shadow-sm shadow-black">
        <CardContent >
          {/* Header Row */}
          <View className="flex-row items-start gap-2">
            <View className="flex-1 gap-1.5">
              {/* Title Row */}
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-foreground leading-tight flex-1" numberOfLines={1}>
                  {tryout.nama}
                </Text>
                <Icon as={ChevronRight} size={18} className="text-muted-foreground/30 mt-0.5" />
              </View>

              {/* Status Badge */}
              <View className="flex-row items-center gap-2">
                {getStatusBadge()}
                {tryout.guru && (
                  <View className="flex-row items-center gap-1">
                    <Icon as={User} size={12} className="text-muted-foreground" />
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {tryout.guru.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {tryout.description && (
                <Text className="text-sm text-muted-foreground mb-2" numberOfLines={2}>
                  {tryout.description}
                </Text>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center gap-2.5 flex-wrap">
            {/* Duration */}
            <View className="bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/30 flex-row items-center gap-1.5">
              <Icon as={Clock} size={12} className="text-muted-foreground" />
              <Text className="text-xs font-medium text-muted-foreground">
                {tryout.duration} menit
              </Text>
            </View>

            {/* Passing Score */}
            <View className="bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/30">
              <Text className="text-xs font-medium text-muted-foreground">
                Lulus: {tryout.passingScore}%
              </Text>
            </View>
          </View>

          {/* Time Info */}
          <View className="pt-2 border-t border-border/30 gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Icon as={Calendar} size={12} className="text-muted-foreground" />
              <View className="flex-row items-center gap-1 flex-1 flex-wrap">
                <Text className="text-xs text-muted-foreground">Mulai:</Text>
                <Text className="text-xs font-medium text-foreground">{formatRelativeTime(tryout.startTime)}</Text>
                <Text className="text-xs text-muted-foreground/60">({formatAbsoluteDate(tryout.startTime)})</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon as={Calendar} size={12} className="text-muted-foreground" />
              <View className="flex-row items-center gap-1 flex-1 flex-wrap">
                <Text className="text-xs text-muted-foreground">Berakhir:</Text>
                <Text className="text-xs font-medium text-foreground">{formatRelativeTime(tryout.endTime)}</Text>
                <Text className="text-xs text-muted-foreground/60">({formatAbsoluteDate(tryout.endTime)})</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
