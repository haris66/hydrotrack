import React, { useMemo, useState } from 'react';
import { Plus, Minus, Droplets, Cloud, CloudOff, CheckCircle2, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { DrinkRecord } from '../types';
import { WaveProgress } from '../components/WaveProgress';

interface HomeProps {
  drinks: DrinkRecord[];
  target: number;
  onAddDrink: () => void;
  onRemoveLastDrink: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  onManualSync: () => void;
  lastSyncError: string | null;
  onClearSyncError: () => void;
}

export const HomePage: React.FC<HomeProps> = ({ 
  drinks, 
  target, 
  onAddDrink, 
  onRemoveLastDrink, 
  syncStatus,
  onManualSync,
  lastSyncError,
  onClearSyncError
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const todayDrinks = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return drinks.filter(d => d.timestamp >= startOfDay.getTime());
  }, [drinks]);

  const count = todayDrinks.length;
  const percentage = (count / target) * 100;
  const remaining = Math.max(0, target - count);

  const handleAdd = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsAnimating(true);
    onAddDrink();
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleRemove = () => {
    if (count > 0) {
      if (navigator.vibrate) navigator.vibrate(5);
      onRemoveLastDrink();
    }
  };

  return (
    <div className="flex flex-col h-full safe-top pb-32">
      {/* Dynamic Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-md3-primaryContainer text-md3-onPrimaryContainer rounded-xl shadow-sm">
            <Droplets size={24} />
          </div>
          <h1 className="text-xl font-bold text-md3-onSurface">HydroTrack</h1>
        </div>
        
        {/* Top Sync Status (Clickable) */}
        <button 
          onClick={onManualSync}
          disabled={syncStatus === 'syncing'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
            syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
            syncStatus === 'syncing' ? 'bg-blue-100 text-blue-700' :
            syncStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {syncStatus === 'syncing' ? <Loader2 size={14} className="animate-spin" /> : 
           syncStatus === 'synced' ? <CheckCircle2 size={14} /> : 
           syncStatus === 'error' ? <CloudOff size={14} /> : <Cloud size={14} />}
          <span className="uppercase tracking-tighter">
            {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'synced' ? 'Synced' : syncStatus === 'error' ? 'Retry' : 'Idle'}
          </span>
        </button>
      </header>

      {/* Main Stats Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Error Notification Bar */}
        {syncStatus === 'error' && lastSyncError && (
          <div className="w-full mb-8 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-xs font-bold leading-tight line-clamp-2">{lastSyncError}</p>
            </div>
            <button onClick={onClearSyncError} className="p-1 hover:bg-white/10 rounded-full">
               <X size={16} />
            </button>
          </div>
        )}

        <div className={`transition-transform duration-200 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          <WaveProgress percentage={percentage} />
        </div>
        
        <div className="mt-8 text-center space-y-1">
          <div className="text-sm font-bold text-md3-secondary uppercase tracking-[0.2em]">Intake</div>
          <div className="text-6xl font-black text-md3-onSurface tracking-tighter">
            {count}<span className="text-3xl text-md3-outline font-light mx-1">/</span>{target}
          </div>
          <div className="mt-2 text-sm font-medium text-md3-outline">
             {remaining > 0 ? `${remaining} glasses to go` : "Target Reached! 🌟"}
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="px-6 space-y-4 mb-4">
        {/* Manual Sync Trigger Button */}
        <button 
          onClick={onManualSync}
          disabled={syncStatus === 'syncing'}
          className="w-full py-4 bg-white border-2 border-md3-primaryContainer rounded-2xl flex items-center justify-center gap-2 text-md3-primary font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-sm"
        >
          {syncStatus === 'syncing' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud Now'}
        </button>

        {/* Counter Buttons Group */}
        <div className="flex gap-4">
          <button 
            onClick={handleRemove}
            disabled={count <= 0}
            className="flex-1 h-20 bg-white border-2 border-red-100 text-red-600 rounded-3xl shadow-sm flex items-center justify-center active:scale-90 transition-all disabled:opacity-20 disabled:grayscale"
          >
            <Minus size={32} />
          </button>

          <button 
            onClick={handleAdd}
            className="flex-[2] h-20 bg-md3-primary text-md3-onPrimary rounded-3xl shadow-lg flex items-center justify-center active:scale-90 transition-all group"
          >
            <Plus size={36} className="group-active:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
