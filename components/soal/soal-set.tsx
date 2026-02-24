import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { User, ChevronRight, Calendar, Lock } from 'lucide-react-native';

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
  const itemCount = set._count?.soals ?? 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Pressable onPress={onPress} className="active:scale-[0.98] transition-transform">
      <Card className=" border-border bg-card shadow-sm shadow-black">
        <CardContent >
          {/* Main Content */}
          <View className="flex-1 gap-1.5">
              {/* Title Row */}
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-foreground leading-tight flex-1" numberOfLines={1}>
                  {set.nama}
                </Text>
                <Icon as={ChevronRight} size={18} className="text-muted-foreground/30" />
              </View>

              {/* Date */}
              <View className="flex-row items-center gap-1.5">
                <Icon as={Calendar} size={12} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  {formatDate(set.createdAt)}
                </Text>
              </View>

              {/* Description */}
              {set.deskripsi && (
                <Text className="text-sm text-muted-foreground leading-snug" numberOfLines={2} ellipsizeMode="tail">
                  {set.deskripsi}
                </Text>
              )}

              {/* Stats */}
              <View className="flex-row items-center gap-2.5 mt-1">
                {/* Item Count */}
                <View className="bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/30">
                  <Text className="text-xs font-medium text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'soal' : 'soal'}
                  </Text>
                </View>

                {/* User */}
                {set.user && (
                  <View className="flex-row items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/30">
                    <Icon as={User} size={12} className="text-muted-foreground" />
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {set.user.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>

          {/* Empty State */}
          {itemCount === 0 && (
            <View className="mt-3 pt-3 border-t border-border/30">
              <Text className="text-xs text-muted-foreground text-center">Buka untuk melihat soal</Text>
            </View>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}
