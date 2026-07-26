import type { Hymn } from '../entities/Hymn';

export interface IHymnRepository {
  init(): Promise<void>;
  getHymnByNumber(bookId: number, number: number): Promise<Hymn | null>;
  searchHymns(query: string, searchByTitle: boolean): Promise<Hymn[]>;
  loadFromSqliteDb(fileBuffer: ArrayBuffer): Promise<{ count: number }>;
  resetToDefaultJson(): Promise<void>;
  getLoadedSourceInfo(): string;
}
