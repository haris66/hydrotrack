import React from 'react';

interface WaveProgressProps {
  percentage: number;
}

export const WaveProgress: React.FC<WaveProgressProps> = ({ percentage }) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className="relative w-64 h-64 rounded-full border-4 border-water-200 bg-white overflow-hidden shadow-xl transform transition-transform duration-300">
      <div className="absolute inset-0 flex items-center justify-center z-10">
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 w-full transition-all duration-700 ease-out"
        style={{ height: `${clampedPercentage}%` }}
      >
        <div className="absolute -top-3 left-0 w-[200%] h-6 animate-wave flex">
           <svg className="w-1/2 h-full text-water-400 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
           </svg>
           <svg className="w-1/2 h-full text-water-400 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
           </svg>
        </div>
        
        <div className="w-full h-full bg-water-400"></div>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <span className={`text-4xl font-bold ${clampedPercentage > 50 ? 'text-white' : 'text-water-900'} transition-colors duration-500`}>
          {Math.round(clampedPercentage)}%
        </span>
      </div>
    </div>
  );
};