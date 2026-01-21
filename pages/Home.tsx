import React, { useMemo, useState } from 'react';
import { Plus, Minus, Droplets, Cloud, CloudOff, CheckCircle2, Loader2 } from 'lucide-react';
import { DrinkRecord } from '../types';
import { WaveProgress } from '../components/WaveProgress';

interface HomeProps {
  drinks: DrinkRecord[];
  target: number;
  onAddDrink: () => void;
  onRemoveLastDrink: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

export const HomePage: React.FC<HomeProps> = ({ drinks, target, onAddDrink, onRemoveLastDrink, syncStatus }) => {
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
    if (navigator.vibrate) navigator.vibrate(5);
    onRemoveLastDrink();
  };

  return (
    <div className="flex flex-col h-full safe-top pb-32">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-md3-primaryContainer text-md3-onPrimaryContainer rounded-xl shadow-sm">
            <Droplets size={24} />
          </div>
          <h1 className="text-xl font-bold text-md3-onSurface">HydroTrack</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sync Status Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            syncStatus === 'synced' ? 'bg-green-50 text-green-600' :
            syncStatus === 'syncing' ? 'bg-blue-50 text-blue-500' :
            syncStatus === 'error' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
          }`}>
            {syncStatus === 'syncing' ? <Loader2 size={14} className="animate-spin" /> : 
             syncStatus === 'synced' ? <CheckCircle2 size={14} /> : 
             syncStatus === 'error' ? <CloudOff size={14} /> : <Cloud size={14} />}
            <span className="hidden sm:inline uppercase tracking-tighter">
              {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'synced' ? 'Saved' : syncStatus === 'error' ? 'Offline' : 'Local'}
            </span>
          </div>

          <button 
            onClick={handleRemove}
            disabled={count === 0}
            className="p-2 text-md3-secondary hover:bg-md3-surfaceVariant rounded-full transition-colors disabled:opacity-30 active:scale-90"
          >
            <Minus size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className={`transition-transform duration-200 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          <WaveProgress percentage={percentage} />
        </div>
        
        <div className="mt-12 text-center space-y-1">
          <div className="text-sm font-medium text-md3-secondary uppercase tracking-widest">Today's Intake</div>
          <div className="text-5xl font-black text-md3-onSurface tracking-tight">
            {count} <span className="text-2xl text-md3-outline font-light">/ {target}</span>
          </div>
          <div className="mt-4 px-6 py-2 bg-md3-primaryContainer text-md3-onPrimaryContainer rounded-full text-sm font-semibold inline-block">
             {remaining > 0 ? `${remaining} glasses left` : "Daily Goal Achieved! ✨"}
          </div>
        </div>
      </div>

      <button 
        onClick={handleAdd}
        className="fixed bottom-24 right-6 w-20 h-20 bg-md3-primaryContainer text-md3-onPrimaryContainer rounded-[28px] shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200 group"
      >
        <Plus size={32} className="group-active:rotate-90 transition-transform" />
      </button>
    </div>
  );
};
