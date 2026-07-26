import type { HistoryRecord } from '../../domain/entities/HistoryRecord';
import type { Hymn } from '../../domain/entities/Hymn';
import type { SchedulePlan } from '../../domain/entities/SchedulePlan';
import type { Settings } from '../../domain/entities/Settings';

const HISTORY_KEY = 'hymn_history_records';
const SETTINGS_KEY = 'hymn_app_settings';
const HOME_DRAFT_KEY = 'hymn_home_draft';
const HOME_ACTIVE_HYMN_KEY = 'hymn_home_active_hymn';
const SCHEDULE_PLANS_KEY = 'hymn_schedule_plans';
const IMPORTED_SCHEDULE_UUIDS_KEY = 'hymn_imported_schedule_uuids';

export interface RememberedHymnState {
  hymn: Hymn;
  sourceTab: number;
}

export class LocalStorageDataSource {
  getHistory(): HistoryRecord[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveHistory(records: HistoryRecord[]): void {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save history to LocalStorage:', e);
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history from LocalStorage:', e);
    }
  }

  getSettings(): Settings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return { fontSize: 18, backgroundColor: '#ffffff' };
  }

  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  getHomeDraft(): string {
    try {
      return localStorage.getItem(HOME_DRAFT_KEY) || '詩歌-';
    } catch {
      return '詩歌-';
    }
  }

  saveHomeDraft(value: string): void {
    try {
      localStorage.setItem(HOME_DRAFT_KEY, value);
    } catch (e) {
      console.error('Failed to save home draft:', e);
    }
  }

  getRememberedHymn(): RememberedHymnState | null {
    try {
      const data = localStorage.getItem(HOME_ACTIVE_HYMN_KEY);
      return data ? JSON.parse(data) as RememberedHymnState : null;
    } catch {
      return null;
    }
  }

  saveRememberedHymn(value: RememberedHymnState | null): void {
    try {
      if (value) {
        localStorage.setItem(HOME_ACTIVE_HYMN_KEY, JSON.stringify(value));
        return;
      }

      localStorage.removeItem(HOME_ACTIVE_HYMN_KEY);
    } catch (e) {
      console.error('Failed to save remembered hymn:', e);
    }
  }

  getSchedulePlans(): SchedulePlan[] {
    try {
      const data = localStorage.getItem(SCHEDULE_PLANS_KEY);
      return data ? JSON.parse(data) as SchedulePlan[] : [];
    } catch {
      return [];
    }
  }

  saveSchedulePlans(plans: SchedulePlan[]): void {
    try {
      localStorage.setItem(SCHEDULE_PLANS_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to save schedule plans:', e);
    }
  }

  getImportedScheduleUuids(): string[] {
    try {
      const data = localStorage.getItem(IMPORTED_SCHEDULE_UUIDS_KEY);
      return data ? JSON.parse(data) as string[] : [];
    } catch {
      return [];
    }
  }

  saveImportedScheduleUuids(uuids: string[]): void {
    try {
      localStorage.setItem(IMPORTED_SCHEDULE_UUIDS_KEY, JSON.stringify(uuids));
    } catch (e) {
      console.error('Failed to save imported schedule uuids:', e);
    }
  }
}
