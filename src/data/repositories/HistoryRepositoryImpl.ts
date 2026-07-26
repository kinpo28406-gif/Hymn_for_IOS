import type { HistoryRecord } from '../../domain/entities/HistoryRecord';
import type { Hymn } from '../../domain/entities/Hymn';
import type { IHistoryRepository } from '../../domain/repositories/IHistoryRepository';
import { LocalStorageDataSource } from '../datasources/LocalStorageDataSource';

export class HistoryRepositoryImpl implements IHistoryRepository {
  private storage: LocalStorageDataSource;

  constructor() {
    this.storage = new LocalStorageDataSource();
  }

  async getHistory(): Promise<HistoryRecord[]> {
    return this.storage.getHistory();
  }

  async addHistory(hymn: Hymn): Promise<void> {
    const current = this.storage.getHistory();
    const filtered = current.filter(
      (item) => !(item.bookId === hymn.bookId && item.number === hymn.number)
    );

    const newRecord: HistoryRecord = {
      id: `${hymn.bookId}-${hymn.number}-${Date.now()}`,
      bookId: hymn.bookId,
      number: hymn.number,
      title: hymn.title,
      timestamp: new Date().toISOString(),
    };

    const updated = [newRecord, ...filtered].slice(0, 100);
    this.storage.saveHistory(updated);
  }

  async clearHistory(): Promise<void> {
    this.storage.clearHistory();
  }
}
