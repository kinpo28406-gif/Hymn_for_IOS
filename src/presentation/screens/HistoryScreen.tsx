import React from 'react';
import type { HistoryRecord } from '../../domain/entities/HistoryRecord';
import { getCategoryText } from '../../domain/entities/Hymn';
import { Trash2, Clock } from 'lucide-react';

interface HistoryScreenProps {
  records: HistoryRecord[];
  onSelectHymn: (bookId: number, number: number) => void;
  onClearHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ records, onSelectHymn, onClearHistory }) => {
  return (
    <div className="screen-root d-flex flex-column p-4 p-sm-4 pt-4 pt-sm-5 overflow-hidden">
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4 flex-shrink-0">
        <h2 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-0">
          <Clock size={22} className="text-success" />
          歷史紀錄
        </h2>
        {records.length > 0 && (
          <button
            onClick={onClearHistory}
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          >
            <Trash2 size={14} />
            清除紀錄
          </button>
        )}
      </div>

      <div className="screen-panel flex-grow-1 overflow-auto">
        {records.length === 0 ? (
          <div className="p-4 text-center text-secondary small">尚無歷史紀錄</div>
        ) : (
          records.map((rec) => {
            const categoryText = getCategoryText(rec.bookId);
            const date = new Date(rec.timestamp);
            const dateFormatted = `${date.getMonth() + 1}/${date.getDate()} ${date
              .getHours()
              .toString()
              .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            return (
              <button
                key={rec.id}
                onClick={() => onSelectHymn(rec.bookId, rec.number)}
                className="result-item w-100 text-start px-3 py-3 border-bottom d-flex flex-column gap-1"
              >
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <span className="small fw-medium text-dark">
                    ({categoryText}){rec.number} - {rec.title}
                  </span>
                  <span className="small text-secondary text-nowrap">{dateFormatted}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
