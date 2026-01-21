import React from 'react';

interface WaveProgressProps {
  percentage: number;
}

export const WaveProgress: React.FC<WaveProgressProps> = ({ percentage }) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className="relative w-72 h-72 rounded-full border-8 border-md3-surfaceVariant bg-white overflow-hidden shadow-2xl transition-all duration-500">
      <div 
        className="absolute bottom-0 left-0 right-0 w-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ height: `${clampedPercentage}%` }}
      >
        {/* Layered waves for depth */}
        <div className="absolute -top-6 left-0 w-[400%] h-12 animate-wave-slow opacity-30 flex">
           {[...Array(4)].map((_, i) => (
             <WaveSvg key={i} className="w-1/4 h-full text-md3-primary fill-current" />
           ))}
        </div>
        <div className="absolute -top-4 left-0 w-[400%] h-10 animate-wave-fast opacity-60 flex" style={{ animationDirection: 'reverse' }}>
           {[...Array(4)].map((_, i) => (
             <WaveSvg key={i} className="w-1/4 h-full text-md3-primary fill-current" />
           ))}
        </div>
        
        <div className="w-full h-full bg-md3-primary"></div>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <span className={`text-6xl font-black transition-colors duration-500 ${clampedPercentage > 55 ? 'text-md3-onPrimary' : 'text-md3-primary'}`}>
          {Math.round(clampedPercentage)}%
        </span>
      </div>
    </div>
  );
};

const WaveSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
  </svg>
);
