import React, { useMemo, useState } from 'react';
import { Plus, Minus, Droplets } from 'lucide-react';
import { DrinkRecord } from '../types';
import { WaveProgress } from '../components/WaveProgress';

interface HomeProps {
  drinks: DrinkRecord[];
  target: number;
  onAddDrink: () => void;
  onRemoveLastDrink: () => void;
}

export const HomePage: React.FC<HomeProps> = ({ drinks, target, onAddDrink, onRemoveLastDrink }) => {
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
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setIsAnimating(true);
    onAddDrink();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleRemove = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onRemoveLastDrink();
  };

  return (
    <div className="flex flex-col items-center justify-between h-full pt-10 pb-24 px-4 max-w-md mx-auto w-full">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Droplets className="text-water-500" fill="currentColor" />
          HydroTrack
        </h1>
        <p className="text-slate-500 text-sm">Stay hydrated, stay healthy</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full my-8">
        <WaveProgress percentage={percentage} />
        
        <div className="w-48 h-2.5 bg-slate-100 rounded-full mt-8 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-water-500 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-5xl font-black text-slate-800 tabular-nums">
            {count} <span className="text-2xl text-slate-400 font-normal">/ {target}</span>
          </div>
          <p className="text-slate-500 mt-2 font-medium">
            {remaining > 0 
              ? `${remaining} more glass${remaining !== 1 ? 'es' : ''} to reach your goal!` 
              : "Daily target reached! Great job! 🎉"}
          </p>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-6">
        <button 
          onClick={handleRemove}
          disabled={count === 0}
          className="p-4 rounded-full bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          aria-label="Remove drink"
        >
          <Minus size={24} />
        </button>

        <button 
          onClick={handleAdd}
          className={`p-6 rounded-full bg-water-500 text-white shadow-lg shadow-water-200 hover:bg-water-600 active:bg-water-700 transition-all transform ${isAnimating ? 'scale-90' : 'scale-100 hover:scale-105'}`}
          aria-label="Add drink"
        >
          <Plus size={40} />
        </button>
      </div>
    </div>
  );
};