import { SyncData } from '../types';

/**
 * We use a public JSON bin service for this demo.
 * Note: For a production app, you should use a secure backend like Firebase or Supabase.
 */
const API_BASE = 'https://api.npoint.io';

export const generateSyncId = () => {
  // Generates a 6-character alphanumeric string (e.g., A1B2C3)
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const pushToCloud = async (syncId: string, data: SyncData): Promise<boolean> => {
  try {
    // We use PUT to upsert (create or update) data at the specific syncId endpoint
    const response = await fetch(`${API_BASE}/${syncId}`, {
      method: 'POST', // Some public bins prefer POST for the first time, but PUT is standard for updates.
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    // If POST fails (bin might already exist), try PUT
    if (!response.ok) {
      const retryResponse = await fetch(`${API_BASE}/${syncId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return retryResponse.ok;
    }

    return response.ok;
  } catch (e) {
    console.error('Cloud Push Failed', e);
    return false;
  }
};

export const pullFromCloud = async (syncId: string): Promise<SyncData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${syncId}`);
    
    // If the bin doesn't exist yet (404), it's not a failure, just a new key
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    
    // Basic validation to ensure we got HydroTrack data
    if (data && typeof data === 'object' && 'drinks' in data) {
      return data as SyncData;
    }
    
    return null;
  } catch (e) {
    console.error('Cloud Pull Failed', e);
    return null;
  }
};
