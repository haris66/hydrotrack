import { SyncData, SyncResult } from '../types';

/**
 * npoint.io is a free, reliable JSON bin service with great CORS support.
 * It provides a simple API to create (POST), update (PUT), and fetch (GET) JSON.
 */
const API_BASE = 'https://api.npoint.io';

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
      return { success: false, error: `Cloud Error ${response.status}: Failed to create bin.` };
    }

    const result = await response.json();
    if (!result.binId) {
      return { success: false, error: 'Cloud provider did not return a bin ID.' };
    }

    return { success: true, data: result.binId };
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
      if (response.status === 404) return { success: false, error: 'Sync session not found or expired.' };
      return { success: false, error: `Upload failed: HTTP ${response.status}` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Cloud push failed. Check internet connection.' };
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
      return { success: false, error: 'Cloud data ID not found.' };
    }
    
    if (!response.ok) {
      return { success: false, error: `Download failed: Status ${response.status}` };
    }

    const data = await response.json();
    
    // Validate data structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.drinks)) {
      return { success: false, error: 'Invalid data format returned from cloud.' };
    }

    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: 'Could not reach cloud server.' };
  }
};
