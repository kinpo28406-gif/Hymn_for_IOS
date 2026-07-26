import type { Hymn } from '../../domain/entities/Hymn';

export interface RawJsonHymn {
  _id: number;
  book_id: number;
  number: number;
  title: string;
  body: string;
  tag_id: number;
}

export class JsonDataSource {
  private hymns: Hymn[] = [];

  async loadDefaultHymns(): Promise<Hymn[]> {
    try {
      const response = await fetch('./assets/hymn_data.json');
      if (!response.ok) {
        throw new Error(`Failed to load hymn_data.json: status ${response.status}`);
      }
      const rawData: RawJsonHymn[] = await response.json();
      this.hymns = rawData.map((item) => ({
        id: item._id,
        bookId: item.book_id,
        number: item.number,
        title: item.title || '',
        body: item.body || '',
        tagId: item.tag_id || 0,
      }));
      return this.hymns;
    } catch (err) {
      console.error('Error fetching default JSON hymns:', err);
      return [];
    }
  }

  getHymns(): Hymn[] {
    return this.hymns;
  }
}
