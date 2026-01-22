import { SyncData, SyncResult } from '../types';

const API_BASE = 'https://jsonblob.com/api/jsonBlob';

/**
 * Creates a new storage bin on the cloud provider.
 * Returns the new ID (UUID) or an error.
 */
export const createCloudBin = async (initialData: SyncData): Promise<SyncResult<string>> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(initialData),
    });

    if (!response.ok) {
      return { success: false, error: `Create failed: ${response.status} ${response.statusText}` };
    }

    const location = response.headers.get('Location');
    if (!location) {
      return { success: false, error: 'Server did not return a valid ID location.' };
    }

    // Extract ID from Location header (last segment of the URL)
    const id = location.substring(location.lastIndexOf('/') + 1);
    return { success: true, data: id };
  } catch (e: any) {
    return { success: false, error: `Network error: ${e.message}` };
  }
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<SyncResult<null>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try to read error body if available
      const text = await response.text().catch(() => '');
      return { success: false, error: `Push failed (${response.status}): ${text || response.statusText}` };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: `Push error: ${e.message}` };
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncResult<SyncData>> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 404) {
      return { success: false, error: 'Key not found. Check if the ID is correct.' };
    }
    
    if (!response.ok) {
      return { success: false, error: `Pull failed: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    
    // Basic validation
    if (data && typeof data === 'object' && ('drinks' in data || 'target' in data)) {
      return { success: true, data: data as SyncData };
    }
    
    return { success: false, error: 'Invalid data format received from cloud.' };
  } catch (e: any) {
    return { success: false, error: `Pull error: ${e.message}` };
  }
};

// Kept for backward compatibility if needed, but creates a placeholder
export const generateSyncId = () => {
  return "Please use 'Generate Sync Key' button";
};
