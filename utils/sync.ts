import { SyncData, SyncResult } from '../types';

/**
 * KVDB.io is a public Key-Value store with native CORS support.
 * We use a dedicated bucket for HydroTrack to store user intake data.
 */
const BUCKET_ID = 'ht_v1_public_sync'; // App-specific bucket name
const API_BASE = `https://kvdb.io/${BUCKET_ID}`;

/**
 * Generates a random, user-friendly sync key
 */
const generateSyncKey = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing 0, O, 1, I
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createCloudBin = async (initialData: SyncData): Promise<SyncResult<string>> => {
  try {
    const syncId = generateSyncKey();
    // In KVDB, we just "PUT" to a key to create it.
    const result = await pushToCloud(syncId, initialData);
    
    if (result.success) {
      return { success: true, data: syncId };
    } else {
      return { success: false, error: result.error };
    }
  } catch (e: any) {
    return { success: false, error: `Initialization failed: ${e.message}` };
  }
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<SyncResult<null>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'POST', // KVDB uses POST/PUT to update keys
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: `Cloud update failed (${response.status})` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Network error: Cloud unreachable.' };
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncResult<SyncData>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`);
    
    if (response.status === 404) {
      return { success: false, error: 'Cloud key not found.' };
    }
    
    if (!response.ok) {
      return { success: false, error: `Download failed: ${response.status}` };
    }

    const data = await response.json();
    
    // Basic validation of returned data
    if (!data || typeof data !== 'object' || !Array.isArray(data.drinks)) {
      return { success: false, error: 'Invalid data format on cloud.' };
    }

    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: 'Network error: Failed to pull data.' };
  }
};
