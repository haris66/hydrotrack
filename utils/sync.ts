import { SyncData, SyncResult } from '../types';

/**
 * Using JSONBlob as the reliable primary provider.
 * We use a slightly different URL structure that is often more CORS-friendly.
 */
const API_BASE = 'https://jsonblob.com/api/jsonBlob';

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
      return { success: false, error: `Cloud Error ${response.status}: Failed to create session.` };
    }

    const location = response.headers.get('Location');
    if (!location) {
      return { success: false, error: 'Cloud provider did not return a session ID.' };
    }

    const id = location.substring(location.lastIndexOf('/') + 1);
    return { success: true, data: id };
  } catch (e: any) {
    if (e.name === 'TypeError') {
      return { success: false, error: 'Sync Blocked (CORS/Network). Try a different browser or disable tracking protection.' };
    }
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
      if (response.status === 404) return { success: false, error: 'Sync session expired or key invalid.' };
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
      return { success: false, error: 'Cloud key not found.' };
    }
    
    if (!response.ok) {
      return { success: false, error: `Download failed: Status ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: 'Could not reach cloud server.' };
  }
};
