import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ChevronDown } from 'lucide-react';
import type { Hymn } from '../../domain/entities/Hymn';
import { getCategoryText } from '../../domain/entities/Hymn';

interface SearchScreenProps {
  onSearch: (query: string, searchByTitle: boolean) => Promise<Hymn[]>;
  onSelectHymn: (hymn: Hymn) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSearch, onSelectHymn }) => {
  const [query, setQuery] = useState<string>('');
  const [searchByTitle, setSearchByTitle] = useState<boolean>(true);
  const [results, setResults] = useState<Hymn[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;
    async function doSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      const res = await onSearch(query, searchByTitle);
      if (isSubscribed) {
        setResults(res);
        setIsSearching(false);
      }
    }

    const timer = setTimeout(doSearch, 200);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [query, searchByTitle, onSearch]);

  return (
    <div className="screen-root d-flex flex-column p-4 p-sm-4 pt-4 pt-sm-5 overflow-hidden">
      <div className="d-flex flex-column gap-3 mb-4 flex-shrink-0">
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="尋找詩歌..."
            className="form-control pe-5"
          />
          <SearchIcon
            size={16}
            className="position-absolute text-secondary"
            style={{ right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        <div className="position-relative flex-shrink-0">
          <select
            value={searchByTitle ? 'Title' : 'Body'}
            onChange={(e) => {
              setSearchByTitle(e.target.value === 'Title');
              setQuery('');
              setResults([]);
            }}
            className="search-select form-select pe-5"
          >
            <option value="Title">標題</option>
            <option value="Body">內容</option>
          </select>
          <ChevronDown
            size={16}
            className="position-absolute text-secondary pe-none"
            style={{ right: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      <div className="screen-panel flex-grow-1 overflow-auto">
        {isSearching && (
          <div className="p-4 text-center text-secondary small">搜尋中...</div>
        )}

        {!isSearching && query.trim() && results.length === 0 && (
          <div className="p-4 text-center text-secondary small">未找到符合的詩歌</div>
        )}

        {!isSearching && !query.trim() && (
          <div className="p-4 text-center text-secondary small">請輸入關鍵字進行搜尋</div>
        )}

        {results.map((hymn) => {
          const categoryText = getCategoryText(hymn.bookId);
          return (
            <button
              key={`${hymn.bookId}-${hymn.number}`}
              onClick={() => onSelectHymn(hymn)}
              className="result-item w-100 text-start px-3 py-3 border-bottom d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <span className="result-badge badge rounded-pill text-nowrap px-3 py-2">
                  {categoryText} 第{hymn.number}首
                </span>
                <span className="small fw-medium text-dark text-truncate">
                  {hymn.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
