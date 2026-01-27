import { SyncData, SyncResult } from '../types';

/**
 * KVDB.io is a public Key-Value store.
 * Strategy: We use 'text/plain' as Content-Type to make it a "Simple Request".
 * Simple Requests do NOT trigger a CORS preflight (OPTIONS), which fixes the Vercel error.
 */
const BUCKET_ID = 'hydrotrack_v1_global';
const API_BASE = `https://kvdb.io/${BUCKET_ID}`;

export const createCloudBin = async (initialData: SyncData): Promise<SyncResult<string>> => {
  try {
    // Generate a clean 6-character ID
    const syncId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = await pushToCloud(syncId, initialData);
    
    if (result.success) {
      return { success: true, data: syncId };
    }
    return { success: false, error: result.error };
  } catch (e: any) {
    return { success: false, error: 'Could not initialize cloud storage.' };
  }
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<SyncResult<null>> => {
  try {
    // We use POST to the key URL.
    // CRITICAL: Content-Type is 'text/plain' to avoid CORS preflight (OPTIONS)
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain' 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: `Cloud sync failed: ${response.status}` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Network error during cloud push.' };
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncResult<SyncData>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'GET',
    });
    
    if (response.status === 404) {
      return { success: false, error: '404' }; // Special code for 'Not Created Yet'
    }
    
    if (!response.ok) {
      return { success: false, error: `Cloud fetch error: ${response.status}` };
    }

    const rawData = await response.text();
    const data = JSON.parse(rawData);
    
    if (!data || typeof data !== 'object' || !Array.isArray(data.drinks)) {
      return { success: false, error: 'Cloud data corrupted.' };
    }

    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: 'Cloud unreachable. Check connection.' };
  }
};
