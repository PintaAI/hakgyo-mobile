// SDK-compatible types for Soal (Questions)

export interface Opsi {
  id: string;
  teks: string;
  isCorrect: boolean;
}

export interface Soal {
  id: number;
  pertanyaan: string;
  opsi: Opsi[];
}

export interface KoleksiSoal {
  id: number;
  judul: string;
  deskripsi: string;
  kategori: 'EPS_TOPIK' | 'READING' | 'LISTENING' | 'GRAMMAR';
  jumlahSoal: number;
  tingkatKesulitan: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface PracticeSession {
  id: string;
  koleksiSoalId: number;
  mulaiPada: string;
  selesaiPada?: string;
}

export interface PracticeResult {
  id: string;
  sessionId: string;
  skor: number;
  totalSoal: number;
  jawabanBenar: number;
  selesaiPada: string;
}

// Mock data for KoleksiSoal (Question Collections)
export const MOCK_KOLEKSI_SOAL: KoleksiSoal[] = [
  {
    id: 1,
    judul: 'EPS TOPIK - Basic',
    deskripsi: 'Latihan dasar untuk EPS TOPIK',
    kategori: 'EPS_TOPIK',
    jumlahSoal: 10,
    tingkatKesulitan: 'BEGINNER',
  },
  {
    id: 2,
    judul: 'EPS TOPIK - Intermediate',
    deskripsi: 'Latihan tingkat menengah',
    kategori: 'EPS_TOPIK',
    jumlahSoal: 15,
    tingkatKesulitan: 'INTERMEDIATE',
  },
  {
    id: 3,
    judul: 'Reading Comprehension',
    deskripsi: 'Latihan membaca teks Korea',
    kategori: 'READING',
    jumlahSoal: 8,
    tingkatKesulitan: 'INTERMEDIATE',
  },
  {
    id: 4,
    judul: 'Listening Practice',
    deskripsi: 'Latihan mendengarkan percakapan',
    kategori: 'LISTENING',
    jumlahSoal: 12,
    tingkatKesulitan: 'BEGINNER',
  },
  {
    id: 5,
    judul: 'Grammar Essentials',
    deskripsi: 'Latihan tata bahasa dasar',
    kategori: 'GRAMMAR',
    jumlahSoal: 10,
    tingkatKesulitan: 'ADVANCED',
  },
];

// Mock data for Soal (Questions)
export const MOCK_SOAL: Soal[] = [
  {
    id: 1,
    pertanyaan: 'Apa arti dari "안녕하세요"?',
    opsi: [
      { id: 'A', teks: 'Terima kasih', isCorrect: false },
      { id: 'B', teks: 'Halo', isCorrect: true },
      { id: 'C', teks: 'Selamat tinggal', isCorrect: false },
      { id: 'D', teks: 'Maaf', isCorrect: false },
    ],
  },
  {
    id: 2,
    pertanyaan: 'Pilih kata yang benar: "저는 학교에 _____."',
    opsi: [
      { id: 'A', teks: '갑니다', isCorrect: true },
      { id: 'B', teks: '가요', isCorrect: false },
      { id: 'C', teks: '갑시다', isCorrect: false },
      { id: 'D', teks: '가십시오', isCorrect: false },
    ],
  },
  {
    id: 3,
    pertanyaan: 'Apa kebalikan dari "가다" (pergi)?',
    opsi: [
      { id: 'A', teks: '오다 (datang)', isCorrect: true },
      { id: 'B', teks: '서다 (berdiri)', isCorrect: false },
      { id: 'C', teks: '앉다 (duduk)', isCorrect: false },
      { id: 'D', teks: '먹다 (makan)', isCorrect: false },
    ],
  },
  {
    id: 4,
    pertanyaan: 'Bacalah teks: "한국어를 공부해요. 매일 학교에 갑니다." Apa yang dilakukan pembicara?',
    opsi: [
      { id: 'A', teks: 'Bekerja', isCorrect: false },
      { id: 'B', teks: 'Belajar bahasa Korea', isCorrect: true },
      { id: 'C', teks: 'Bermain', isCorrect: false },
      { id: 'D', teks: 'Tidur', isCorrect: false },
    ],
  },
  {
    id: 5,
    pertanyaan: '"감사합니다" berarti...',
    opsi: [
      { id: 'A', teks: 'Halo', isCorrect: false },
      { id: 'B', teks: 'Maaf', isCorrect: false },
      { id: 'C', teks: 'Terima kasih', isCorrect: true },
      { id: 'D', teks: 'Sampai jumpa', isCorrect: false },
    ],
  },
];

// Mock practice results
export const MOCK_PRACTICE_RESULTS: PracticeResult[] = [
  {
    id: '1',
    sessionId: 'session-1',
    skor: 85,
    totalSoal: 12,
    jawabanBenar: 10,
    selesaiPada: new Date().toISOString(),
  },
];

// Helper function to map old difficulty to new difficulty
export function mapDifficulty(
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  switch (difficulty) {
    case 'EASY':
      return 'BEGINNER';
    case 'MEDIUM':
      return 'INTERMEDIATE';
    case 'HARD':
      return 'ADVANCED';
  }
}

// Helper function to map new difficulty to old difficulty (for backward compatibility)
export function mapDifficultyToOld(
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
): 'EASY' | 'MEDIUM' | 'HARD' {
  switch (difficulty) {
    case 'BEGINNER':
      return 'EASY';
    case 'INTERMEDIATE':
      return 'MEDIUM';
    case 'ADVANCED':
      return 'HARD';
  }
}
