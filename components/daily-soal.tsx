import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { soalApi, useAuth, type Soal } from 'hakgyo-expo-sdk';
import { Quiz } from '@/components/soal/quiz';

export function DailySoal() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyQuestions();
  }, []);

  const fetchDailyQuestions = async () => {
    try {
      setLoading(true);
      // Fetch personalized daily questions based on user's classes and collections
      const response = await soalApi.getDaily(user?.id || '', 5);

      if (response.success && response.data) {
        setQuestions(response.data);
      } else {
        Alert.alert('Error', 'Gagal memuat soal harian.');
      }
    } catch (error) {
      console.error('Error fetching daily questions:', error);
      Alert.alert('Error', 'Gagal memuat soal harian. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Quiz
      questions={questions}
      title="Latihan Harian"
      loading={loading}
      loopOnComplete={true}
      showProgress={true}
    />
  );
}
