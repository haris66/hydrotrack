import { DrinkRecord, STORAGE_KEY_DRINKS, STORAGE_KEY_TARGET, STORAGE_KEY_VIEW, DEFAULT_DAILY_TARGET, View } from '../types';

export const getStoredDrinks = (): DrinkRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DRINKS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load drinks", e);
    return [];
  }
};

export const saveStoredDrinks = (drinks: DrinkRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_DRINKS, JSON.stringify(drinks));
  } catch (e) {
    console.error("Failed to save drinks", e);
  }
};

export const getStoredTarget = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TARGET);
    return stored ? parseInt(stored, 10) : DEFAULT_DAILY_TARGET;
  } catch (e) {
    return DEFAULT_DAILY_TARGET;
  }
};

export const saveStoredTarget = (target: number) => {
  try {
    localStorage.setItem(STORAGE_KEY_TARGET, target.toString());
  } catch (e) {
    console.error("Failed to save target", e);
  }
};

export const getStoredView = (): View => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VIEW);
    return (stored as View) || 'home';
  } catch (e) {
    return 'home';
  }
};

export const saveStoredView = (view: View) => {
  try {
    localStorage.setItem(STORAGE_KEY_VIEW, view);
  } catch (e) {
    console.error("Failed to save view", e);
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY_DRINKS);
  localStorage.removeItem(STORAGE_KEY_TARGET);
  localStorage.removeItem(STORAGE_KEY_VIEW);
  window.location.reload();
};
