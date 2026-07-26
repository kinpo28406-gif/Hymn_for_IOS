import type { HistoryRecord } from '../entities/HistoryRecord';
import type { Hymn } from '../entities/Hymn';

export interface IHistoryRepository {
  getHistory(): Promise<HistoryRecord[]>;
  addHistory(hymn: Hymn): Promise<void>;
  clearHistory(): Promise<void>;
}
