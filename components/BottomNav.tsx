import React from 'react';
import { Home, History, Settings, Droplet } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'home', icon: Droplet, label: 'Track' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-md3-surface border-t border-md3-surfaceVariant safe-bottom pt-3 pb-2 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div className={`px-5 py-1 rounded-full transition-all duration-300 ${isActive ? 'bg-md3-primaryContainer text-md3-onPrimaryContainer' : 'text-md3-secondary hover:bg-md3-surfaceVariant'}`}>
                <Icon size={24} fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-xs font-medium transition-colors ${isActive ? 'text-md3-onSurface' : 'text-md3-secondary'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
