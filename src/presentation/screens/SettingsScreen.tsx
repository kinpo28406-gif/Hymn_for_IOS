import React from 'react';
import type { Settings as SettingsEntity } from '../../domain/entities/Settings';
import { Sliders, Database, RotateCcw, UserCheck } from 'lucide-react';

interface SettingsScreenProps {
  settings: SettingsEntity;
  onUpdateSettings: (newSettings: Partial<SettingsEntity>) => void;
  dataSourceInfo: string;
  onImportDb: (file: File) => void;
  onResetDb: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  dataSourceInfo,
  onImportDb,
  onResetDb,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportDb(e.target.files[0]);
    }
  };

  return (
    <div className="screen-root overflow-auto p-4 p-sm-4 pt-4 pt-sm-5">
      <div className="d-flex flex-column gap-4">
        <h2 className="h4 fw-bold text-dark d-flex align-items-center gap-2 pb-2 border-bottom mb-0 flex-shrink-0">
          <Sliders size={20} className="text-success" />
          設置 (Settings)
        </h2>

        <div className="screen-panel p-4 d-flex flex-column gap-3">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <label className="form-label small fw-semibold text-secondary mb-0">字體大小 (Font Size)</label>
            <span className="small fw-semibold text-success">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="32"
            step="1"
            value={settings.fontSize}
            onChange={(e) => onUpdateSettings({ fontSize: parseFloat(e.target.value) })}
            className="form-range"
          />

          <div
            className="rounded-4 border bg-body-tertiary text-center px-3 py-3"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            這是一段預覽文字。 This is sample text with the current settings.
          </div>
        </div>

        <div className="screen-panel p-4 d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-2">
            <Database size={16} className="text-success" />
            <h3 className="h6 fw-semibold text-dark mb-0">資料來源 (.db 檔案管理)</h3>
          </div>

          <div className="alert alert-success small mb-0 py-2 px-3">
            目前狀態：<span className="fw-semibold">{dataSourceInfo}</span>
          </div>

          <div className="d-flex flex-column gap-2 pt-1">
            <label className="btn btn-success d-flex align-items-center justify-content-center gap-2 py-2">
              <Database size={16} />
              匯入 .db SQLite 資料庫檔案
              <input
                type="file"
                accept=".db,.sqlite,.sqlite3"
                onChange={handleFileChange}
                className="d-none"
              />
            </label>

            <button
              onClick={onResetDb}
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
            >
              <RotateCcw size={14} />
              重置為內建資料庫 (hymn_data.json)
            </button>
          </div>
        </div>

        <div className="screen-panel p-4 text-center d-flex flex-column gap-1">
          <p className="small text-secondary fw-medium mb-0">Version: 1.0.0 (100% Client-Side Static)</p>
          <p className="small text-secondary fw-medium d-flex align-items-center justify-content-center gap-1 mb-0">
            <UserCheck size={14} className="text-success" />
            Author: Lenny(梁)
          </p>
        </div>
      </div>
    </div>
  );
};
