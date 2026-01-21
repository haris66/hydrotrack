export interface DrinkRecord {
  id: string;
  timestamp: number;
  amount: number;
}

export interface DailyStat {
  date: string;
  count: number;
  metTarget: boolean;
}

export type View = 'home' | 'history' | 'settings';

export const DEFAULT_DAILY_TARGET = 8;
export const STORAGE_KEY_DRINKS = 'hydrotrack_drinks';
export const STORAGE_KEY_TARGET = 'hydrotrack_target';