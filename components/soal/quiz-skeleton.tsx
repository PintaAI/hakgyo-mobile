import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizSkeletonProps {
  tryoutMode?: boolean;
}

export function QuizSkeleton({ tryoutMode = false }: QuizSkeletonProps) {
  return (
    <Card className="border-primary/20">
      <CardContent>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </View>

        {/* Question */}
        <View className="mb-4">
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-4/5 mb-2" />
          <Skeleton className="h-5 w-3/5" />
        </View>

        {/* Options */}
        <View className="gap-2 mb-4">
          {[1, 2, 3, 4].map((index) => (
            <View key={index} className="justify-start h-auto min-h-10 py-3 px-4 bg-muted/50 rounded-lg">
              <View className="flex-row items-center gap-3 w-full">
                {/* Option number circle */}
                <Skeleton className="w-6 h-6 rounded-full" />
                {/* Option text */}
                <Skeleton className="h-5 flex-1" />
              </View>
            </View>
          ))}
        </View>

        {/* Tryout mode: Next/Submit button */}
        {tryoutMode && (
          <View className="flex-row justify-end">
            <Skeleton className="h-9 w-24 rounded-lg" />
          </View>
        )}

        {/* Practice mode: Result section skeleton */}
        {!tryoutMode && (
          <View className="gap-3">
            {/* Explanation skeleton */}
            <View className="bg-muted/50 rounded-lg p-3 border border-border">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </View>
            {/* Result buttons skeleton */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-5 w-16" />
              </View>
              <Skeleton className="h-9 w-20 rounded-lg" />
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
