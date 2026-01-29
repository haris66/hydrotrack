import { SyncData, SyncResult } from '../types';

/**
 * JSONStorage.net is a free, reliable JSON storage service.
 * It does not require pre-created accounts or buckets.
 */
const API_BASE = 'https://api.jsonstorage.net/v1/json';

export const createCloudBin = async (initialData: SyncData): Promise<SyncResult<string>> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initialData),
    });

    if (!response.ok) {
      return { success: false, error: `Cloud Error ${response.status}: Failed to provision storage.` };
    }

    const result = await response.json();
    // result.uri is like "https://api.jsonstorage.net/v1/json/123-abc-456"
    if (!result.uri) {
      return { success: false, error: 'Storage provider did not return a valid URI.' };
    }

    const syncId = result.uri.split('/').pop();
    return { success: true, data: syncId };
  } catch (e: any) {
    return { success: false, error: `Connection failed: ${e.message}` };
  }
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<SyncResult<null>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: `Upload failed: Status ${response.status}` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Network error during cloud backup.' };
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncResult<SyncData>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 404) {
      return { success: false, error: 'Cloud session not found.' };
    }
    
    if (!response.ok) {
      return { success: false, error: `Download failed: Status ${response.status}` };
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object' || !Array.isArray(data.drinks)) {
      return { success: false, error: 'Data on cloud is in an unrecognized format.' };
    }

    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: 'Cloud storage is currently unreachable.' };
  }
};
