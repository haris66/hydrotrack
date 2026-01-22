import { SyncData, SyncResult } from '../types';

// Using JSONBlob as the primary provider.
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
      const errText = await response.text().catch(() => 'No error body');
      return { success: false, error: `Server error ${response.status}: ${errText}` };
    }

    const location = response.headers.get('Location');
    if (!location) {
      return { success: false, error: 'Cloud provider did not return a session ID.' };
    }

    const id = location.substring(location.lastIndexOf('/') + 1);
    return { success: true, data: id };
  } catch (e: any) {
    return { success: false, error: `Connection failed: ${e.message}. Check your internet.` };
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
      const text = await response.text().catch(() => 'No error body');
      return { success: false, error: `Upload failed (${response.status}): ${text}` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: `Network error during push: ${e.message}` };
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
      return { success: false, error: 'Sync key not found on server.' };
    }
    
    if (!response.ok) {
      return { success: false, error: `Download failed: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: data as SyncData };
  } catch (e: any) {
    return { success: false, error: `Network error during pull: ${e.message}` };
  }
};
