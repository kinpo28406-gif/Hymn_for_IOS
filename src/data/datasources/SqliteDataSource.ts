import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import type { Hymn } from '../../domain/entities/Hymn';

export class SqliteDataSource {
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;

  async initSqlEngine(): Promise<void> {
    if (!this.SQL) {
      this.SQL = await initSqlJs({
        locateFile: (file) => `./assets/${file}`,
      });
    }
  }

  async loadFromBuffer(buffer: ArrayBuffer): Promise<Hymn[]> {
    await this.initSqlEngine();
    if (!this.SQL) throw new Error('SQL.js could not be initialized');

    if (this.db) {
      this.db.close();
    }

    const uint8Array = new Uint8Array(buffer);
    this.db = new this.SQL.Database(uint8Array);

    const tablesResult = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    if (!tablesResult || tablesResult.length === 0 || !tablesResult[0].values.length) {
      throw new Error('No valid table found in the uploaded .db file');
    }

    const tableNames = tablesResult[0].values.map((v) => String(v[0]));
    const targetTable = tableNames.find((t) => ['hymns', 'hymn', 'hymn_data', 'hymn_table'].includes(t.toLowerCase())) || tableNames[0];

    const result = this.db.exec(`SELECT * FROM ${targetTable}`);
    if (!result || result.length === 0) {
      return [];
    }

    const columns = result[0].columns.map((c) => c.toLowerCase());
    const values = result[0].values;

    const idIdx = columns.findIndex((c) => c === '_id' || c === 'id');
    const bookIdIdx = columns.findIndex((c) => c === 'book_id' || c === 'bookid');
    const numberIdx = columns.findIndex((c) => c === 'number' || c === 'no' || c === 'num');
    const titleIdx = columns.findIndex((c) => c === 'title' || c === 'name');
    const bodyIdx = columns.findIndex((c) => c === 'body' || c === 'content' || c === 'lyrics');
    const tagIdIdx = columns.findIndex((c) => c === 'tag_id' || c === 'tagid');

    const hymns: Hymn[] = values.map((row, idx) => {
      return {
        id: idIdx !== -1 ? Number(row[idIdx]) : idx + 1,
        bookId: bookIdIdx !== -1 ? Number(row[bookIdIdx]) : 1,
        number: numberIdx !== -1 ? Number(row[numberIdx]) : idx + 1,
        title: titleIdx !== -1 ? String(row[titleIdx] || '') : '',
        body: bodyIdx !== -1 ? String(row[bodyIdx] || '') : '',
        tagId: tagIdIdx !== -1 ? Number(row[tagIdIdx]) : 0,
      };
    });

    return hymns;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
