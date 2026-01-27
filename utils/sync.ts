import { SyncData, SyncResult } from '../types';

/**
 * KVDB.io bucket structure: https://kvdb.io/BUCKET_ID/KEY
 * Per user request: Sync ID (e.g., ZX6EVX) is used as the BUCKET_ID.
 * We use 'data' as the fixed key inside that bucket.
 */
const getSyncUrl = (syncId: string) => `https://kvdb.io/${syncId}/data`;

export const createCloudBin = async (initialData: SyncData): Promise<SyncResult<string>> => {
  try {
    // Generate a clean 6-character ID for the new bucket
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
    // We use POST to the bucket/key URL.
    // Content-Type 'text/plain' makes this a "Simple Request", skipping CORS preflight (OPTIONS).
    const response = await fetch(getSyncUrl(syncId), {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain' 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: `Cloud sync failed: HTTP ${response.status}` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Network error during cloud push.' };
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncResult<SyncData>> => {
  try {
    const response = await fetch(getSyncUrl(syncId), {
      method: 'GET',
    });
    
    // 404 means the bucket or the 'data' key doesn't exist yet.
    if (response.status === 404) {
      return { success: false, error: '404' }; 
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
