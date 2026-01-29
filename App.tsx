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

  const performPush = async (id: string) => {
    const data: SyncData = {
      drinks,
      target,
      updatedAt: Date.now()
    };
    const result = await pushToCloud(id, data);
    if (result.success) {
      setSyncStatus('synced');
      addLog('success', 'Pantry backup updated.');
    } else {
      setSyncStatus('error');
      addLog('error', result.error || 'Failed to update Pantry.');
    }
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
        addLog('info', `Connecting to Pantry basket: ${syncId}`);
        const result = await pullFromCloud(syncId);
        
        if (result.success && result.data) {
          const cloudData = result.data;
          // Strategy: if local is empty or older, take cloud
          if (loadedDrinks.length === 0 || cloudData.updatedAt > (Date.now() - 300000)) {
            setDrinks(cloudData.drinks);
            setTarget(cloudData.target);
            addLog('success', 'Data synced from Pantry.');
          } else {
            addLog('info', 'Local data is up to date.');
          }
          setSyncStatus('synced');
        } else if (result.error === '404') {
          // Basket doesn't exist yet, initialize it
          addLog('info', 'New Pantry session. Initializing cloud storage...');
          await performPush(syncId);
        } else {
          setSyncStatus('error');
          addLog('error', result.error || 'Pantry connection failed.');
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

  const triggerCloudSync = () => {
    if (!syncId) return;
    setSyncStatus('syncing');
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => performPush(syncId), 2500);
  };

  const handleManualSync = () => {
    if (!syncId) return;
    setSyncStatus('syncing');
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    addLog('info', 'Manual sync triggered...');
    performPush(syncId);
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
        addLog('info', `Switching to Pantry basket: ${id}`);
        pullFromCloud(id).then(async result => {
             if (result.success && result.data) {
                setDrinks(result.data.drinks);
                setTarget(result.data.target);
                addLog('success', 'Connected to existing Pantry data.');
                setSyncStatus('synced');
             } else {
                // If 404 or other error, push current state to claim/create the basket
                addLog('info', 'Claiming Pantry session with local data...');
                await performPush(id);
             }
        });
    } else {
        setSyncStatus('idle');
        addLog('info', 'Sync disabled.');
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
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-md3-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-md3-outline uppercase tracking-widest">Hydrating...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-md3-surface text-md3-onSurface">
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
