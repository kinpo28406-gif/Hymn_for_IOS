import type { Hymn } from '../../domain/entities/Hymn';
import type { IHymnRepository } from '../../domain/repositories/IHymnRepository';
import { JsonDataSource } from '../datasources/JsonDataSource';
import { SqliteDataSource } from '../datasources/SqliteDataSource';

export class HymnRepositoryImpl implements IHymnRepository {
  private jsonDataSource: JsonDataSource;
  private sqliteDataSource: SqliteDataSource;
  private hymns: Hymn[] = [];
  private currentSourceInfo = '內建資料庫 (hymn_data.json)';

  constructor() {
    this.jsonDataSource = new JsonDataSource();
    this.sqliteDataSource = new SqliteDataSource();
  }

  async init(): Promise<void> {
    if (this.hymns.length === 0) {
      this.hymns = await this.jsonDataSource.loadDefaultHymns();
      this.currentSourceInfo = '內建資料庫 (hymn_data.json)';
    }
  }

  async getHymnByNumber(bookId: number, number: number): Promise<Hymn | null> {
    await this.init();
    const found = this.hymns.find((h) => h.bookId === bookId && h.number === number);
    return found || null;
  }

  async searchHymns(query: string, searchByTitle: boolean): Promise<Hymn[]> {
    await this.init();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return this.hymns.filter((h) => {
      if (searchByTitle) {
        return h.title.toLowerCase().includes(trimmed);
      } else {
        return h.body.toLowerCase().includes(trimmed);
      }
    });
  }

  async loadFromSqliteDb(fileBuffer: ArrayBuffer): Promise<{ count: number }> {
    const loadedHymns = await this.sqliteDataSource.loadFromBuffer(fileBuffer);
    if (loadedHymns.length > 0) {
      this.hymns = loadedHymns;
      this.currentSourceInfo = `自訂 .db 檔案 (${loadedHymns.length} 首詩歌)`;
    }
    return { count: loadedHymns.length };
  }

  async resetToDefaultJson(): Promise<void> {
    this.hymns = await this.jsonDataSource.loadDefaultHymns();
    this.currentSourceInfo = '內建資料庫 (hymn_data.json)';
  }

  getLoadedSourceInfo(): string {
    return this.currentSourceInfo;
  }
}
