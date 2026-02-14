export interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  isLearned: boolean;
  type: 'WORD' | 'SENTENCE' | 'IDIOM';
  pos?: 'KATA_KERJA' | 'KATA_BENDA' | 'KATA_SIFAT' | 'KATA_KETERANGAN';
  audioUrl?: string;
  exampleSentences: string[];
}

export const MOCK_DATA: VocabularyItem[] = [
  {
    id: 1,
    korean: '안녕하세요',
    indonesian: 'Halo',
    isLearned: false,
    type: 'WORD',
    pos: 'KATA_KETERANGAN',
    exampleSentences: ['안녕하세요, 만나서 반가워요.']
  },
  {
    id: 2,
    korean: '감사합니다',
    indonesian: 'Terima kasih',
    isLearned: false,
    type: 'WORD',
    pos: 'KATA_KETERANGAN',
    exampleSentences: ['도와주셔서 감사합니다.']
  },
  {
    id: 3,
    korean: '학교',
    indonesian: 'Sekolah',
    isLearned: false,
    type: 'WORD',
    pos: 'KATA_BENDA',
    exampleSentences: ['저는 매일 학교에 갑니다.']
  },
  {
    id: 4,
    korean: '공부하다',
    indonesian: 'Belajar',
    isLearned: false,
    type: 'WORD',
    pos: 'KATA_KERJA',
    exampleSentences: ['한국어를 공부해요.']
  },
  {
    id: 5,
    korean: '친구',
    indonesian: 'Teman',
    isLearned: false,
    type: 'WORD',
    pos: 'KATA_BENDA',
    exampleSentences: ['친구와 같이 영화를 봤어요.']
  }
];
