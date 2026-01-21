import React, { useState, useEffect } from 'react';
import { DrinkRecord, View } from './types';
import { getStoredDrinks, saveStoredDrinks, getStoredTarget, saveStoredTarget } from './utils/storage';
import { HomePage } from './pages/Home';
import { HistoryPage } from './pages/History';
import { SettingsPage } from './pages/Settings';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [drinks, setDrinks] = useState<DrinkRecord[]>([]);
  const [target, setTarget] = useState<number>(8);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedDrinks = getStoredDrinks();
    const loadedTarget = getStoredTarget();
    setDrinks(loadedDrinks);
    setTarget(loadedTarget);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveStoredDrinks(drinks);
    }
  }, [drinks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveStoredTarget(target);
    }
  }, [target, isLoaded]);

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
      if (drink.timestamp >= today.getTime()) {
        return index;
      }
      return lastIndex;
    }, -1);

    if (lastTodayIndex !== -1) {
      const newDrinks = [...drinks];
      newDrinks.splice(lastTodayIndex, 1);
      setDrinks(newDrinks);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col font-sans text-slate-900">
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === 'home' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <HomePage 
            drinks={drinks} 
            target={target} 
            onAddDrink={addDrink} 
            onRemoveLastDrink={removeLastDrink}
          />
        </div>
        
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === 'history' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <HistoryPage drinks={drinks} target={target} />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-300 ${view === 'settings' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <SettingsPage target={target} setTarget={setTarget} />
        </div>
      </main>

      <BottomNav currentView={view} setView={setView} />
    </div>
  );
};

export default App;