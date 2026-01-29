import { SyncData, SyncResult } from '../types';

/**
 * Pantry Cloud (getpantry.cloud) provides free JSON storage.
 * Structure: https://getpantry.cloud/apiv1/pantry/{PANTRY_ID}/basket/{BASKET_ID}
 */
const PANTRY_ID = 'a7d8856c-0e29-4d92-9a9f-35c9a4194098'; // Dedicated Pantry for HydroTrack
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket`;

export const createCloudBin = async (initialData: SyncData): Promise<SyncResult<string>> => {
  try {
    // Generate a clean 6-character ID for the user's basket
    const syncId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = await pushToCloud(syncId, initialData);
    
    if (result.success) {
      return { success: true, data: syncId };
    }
    return { success: false, error: result.error };
  } catch (e: any) {
    return { success: false, error: 'Could not initialize Pantry storage.' };
  }
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<SyncResult<null>> => {
  try {
    // Pantry POST creates or replaces the basket content.
    const response = await fetch(`${BASE_URL}/${syncId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: `Pantry Error ${response.status}: Sync failed.` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Network error connecting to Pantry.' };
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncResult<SyncData>> => {
  try {
    const response = await fetch(`${BASE_URL}/${syncId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 404) {
      return { success: false, error: '404' }; // Special code: basket doesn't exist yet
    }
    
    if (!response.ok) {
      return { success: false, error: `Download failed: Status ${response.status}` };
    }

    const data = await response.json();
    
    // Validate data structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.drinks)) {
      return { success: false, error: 'Invalid data format in Pantry.' };
    }

    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: 'Pantry server unreachable.' };
  }
};
