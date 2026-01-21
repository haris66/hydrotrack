import React from 'react';
import { Home, BarChart2, Settings } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Tracker' },
    { id: 'history', icon: BarChart2, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe-area pt-2 px-6 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 ${
                isActive ? 'text-water-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'block' : 'hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};