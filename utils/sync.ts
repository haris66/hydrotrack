import { SyncData } from '../types';

// We use npoint.io or a similar anonymous JSON storage for this demo logic.
// In a production app, this would point to a Firebase or Supabase backend.
const API_BASE = 'https://api.npoint.io';

export const generateSyncId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (e) {
    console.error('Cloud Push Failed', e);
    return false;
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error('Cloud Pull Failed', e);
    return null;
  }
};
