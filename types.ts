export interface DrinkRecord {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  amount: number; // Assuming 1 glass = 1 unit
}

export interface DailyStat {
  date: string; // ISO Date string YYYY-MM-DD
  count: number;
  metTarget: boolean;
}

export type View = 'home' | 'history' | 'settings';

export const DEFAULT_DAILY_TARGET = 8;
export const STORAGE_KEY_DRINKS = 'hydrotrack_drinks';
export const STORAGE_KEY_TARGET = 'hydrotrack_target';
export const STORAGE_KEY_VIEW = 'hydrotrack_view';
export const STORAGE_KEY_SYNC_ID = 'hydrotrack_sync_id';

export interface SyncData {
  drinks: DrinkRecord[];
  target: number;
  updatedAt: number;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  status: 'success' | 'error' | 'info';
  message: string;
}
