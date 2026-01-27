import React, { useState, useEffect, useRef } from 'react';
import { DrinkRecord, View, SyncData, STORAGE_KEY_SYNC_ID, SyncLog } from './types';
import { 
  getStoredDrinks, 
  saveStoredDrinks, 
  getStoredTarget, 
  saveStoredTarget, 
  getStoredView, 
  saveStoredView 
} from './utils/storage';
import { pullFromCloud, pushToCloud } from './utils/sync';
import { HomePage } from './pages/Home';
import { HistoryPage } from './pages/History';
import { SettingsPage } from './pages/Settings';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [drinks, setDrinks] = useState<DrinkRecord[]>([]);
  const [target, setTarget] = useState<number>(8);
  const [syncId, setSyncId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SYNC_ID);
    return (stored && stored !== 'null' && stored !== 'undefined') ? stored : null;
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = (status: 'success' | 'error' | 'info', message: string) => {
    const newLog: SyncLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status,
      message
    };
    setSyncLogs(prev => [newLog, ...prev].slice(0, 10));
    if (status === 'error') setLastSyncError(message);
    else if (status === 'success') setLastSyncError(null);
  };

  useEffect(() => {
    const init = async () => {
      const loadedDrinks = getStoredDrinks();
      const loadedTarget = getStoredTarget();
      const loadedView = getStoredView();
      
      setDrinks(loadedDrinks);
      setTarget(loadedTarget);
      setView(loadedView);
      
      if (syncId) {
        setSyncStatus('syncing');
        addLog('info', 'Connecting to cloud service...');
        const result = await pullFromCloud(syncId);
        
        if (result.success && result.data) {
          const cloudData = result.data;
          // Simple conflict resolution: if cloud has more data or is very recent, take it
          if (cloudData.drinks.length > loadedDrinks.length || (cloudData.drinks.length === loadedDrinks.length && cloudData.updatedAt > (Date.now() - 300000))) {
            setDrinks(cloudData.drinks);
            setTarget(cloudData.target);
            addLog('success', `Cloud sync active: ${cloudData.drinks.length} records.`);
          } else {
            addLog('info', 'Local data is up to date.');
          }
          setSyncStatus('synced');
        } else {
          // If pull failed, we keep local data but mark error
          setSyncStatus('error');
          addLog('error', result.error || 'Failed to pull cloud data.');
        }
      }
      
      setIsLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveStoredDrinks(drinks);
      triggerCloudSync();
    }
  }, [drinks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveStoredTarget(target);
      triggerCloudSync();
    }
  }, [target, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveStoredView(view);
    }
  }, [view, isLoaded]);

  const performSync = async () => {
    if (!syncId) return;
    
    const data: SyncData = {
      drinks,
      target,
      updatedAt: Date.now()
    };
    
    const result = await pushToCloud(syncId, data);
    setSyncStatus(result.success ? 'synced' : 'error');
    
    if (result.success) {
      addLog('success', 'Backup saved to cloud.');
    } else {
      addLog('error', result.error || 'Cloud backup failed.');
    }
  };

  const triggerCloudSync = () => {
    if (!syncId) return;
    setSyncStatus('syncing');
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(performSync, 2500);
  };

  const handleManualSync = () => {
    if (!syncId) return;
    setSyncStatus('syncing');
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    addLog('info', 'Syncing manually...');
    performSync();
  };

  const handleSetSyncId = (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY_SYNC_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_SYNC_ID);
    }
    setSyncId(id);
    
    if (id) {
        setSyncStatus('syncing');
        addLog('info', 'Connecting to existing session...');
        pullFromCloud(id).then(result => {
             if (result.success && result.data) {
                setDrinks(result.data.drinks);
                setTarget(result.data.target);
                addLog('success', 'Successfully connected and updated data.');
                setSyncStatus('synced');
             } else {
                // If it's a new ID that hasn't been pushed yet, initialize it
                addLog('info', 'ID not found on cloud. Initializing new backup...');
                performSync();
             }
        });
    } else {
        setSyncStatus('idle');
        addLog('info', 'Cloud sync disabled.');
    }
  };

  const addDrink = () => {
    const newDrink: DrinkRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      amount: 1,
    };
    setDrinks(prev => [...prev, newDrink]);
  };

  const removeLastDrink = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const lastTodayIndex = drinks.reduce((lastIndex, drink, index) => {
      if (drink.timestamp >= today.getTime()) return index;
      return lastIndex;
    }, -1);

    if (lastTodayIndex !== -1) {
      const newDrinks = [...drinks];
      newDrinks.splice(lastTodayIndex, 1);
      setDrinks(newDrinks);
    }
  };

  if (!isLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-md3-surface">
      <div className="w-12 h-12 border-4 border-md3-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-md3-surface">
      <main className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 transition-all duration-300 transform ${view === 'home' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
          <HomePage 
            drinks={drinks} 
            target={target} 
            onAddDrink={addDrink} 
            onRemoveLastDrink={removeLastDrink} 
            syncStatus={syncStatus}
            onManualSync={handleManualSync}
            lastSyncError={lastSyncError}
            onClearSyncError={() => setLastSyncError(null)}
          />
        </div>
        
        <div className={`absolute inset-0 transition-all duration-300 transform ${view === 'history' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
          <HistoryPage drinks={drinks} target={target} />
        </div>

        <div className={`absolute inset-0 transition-all duration-300 transform ${view === 'settings' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
           <SettingsPage 
            target={target} 
            setTarget={setTarget} 
            totalRecords={drinks.length} 
            syncId={syncId} 
            onSetSyncId={handleSetSyncId}
            syncLogs={syncLogs}
            onClearLogs={() => setSyncLogs([])}
            onManualSync={handleManualSync}
           />
        </div>
      </main>

      <BottomNav currentView={view} setView={setView} />
    </div>
  );
};

export default App;
