export interface Hymn {
  id: number;
  bookId: number; // 1: 詩歌, 2: 補充, 3: 新歌, 4: 新詩, 5/6: 藍本
  number: number;
  title: string;
  body: string;
  tagId: number;
}

export type CategoryName = '詩歌' | '補充' | '新歌' | '新詩' | '藍本';

export const BOOK_CATEGORY_MAP: Record<number, CategoryName> = {
  1: '詩歌',
  2: '補充',
  3: '新歌',
  4: '新詩',
  5: '藍本',
  6: '藍本',
};

export const CATEGORY_BOOK_MAP: Record<string, number> = {
  '詩歌': 1,
  '補充': 2,
  '新歌': 3,
  '新詩': 4,
  '藍本': 5,
};

export function getCategoryText(bookId: number): CategoryName | '詩歌' {
  return BOOK_CATEGORY_MAP[bookId] || '詩歌';
}
