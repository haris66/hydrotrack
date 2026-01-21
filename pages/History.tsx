import React, { useMemo } from 'react';
import { DrinkRecord, DailyStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CalendarCheck, Trophy, Droplet } from 'lucide-react';

interface HistoryProps {
  drinks: DrinkRecord[];
  target: number;
}

export const HistoryPage: React.FC<HistoryProps> = ({ drinks, target }) => {
  // Process data for the last 30 days
  const data = useMemo(() => {
    const stats: DailyStat[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;

      const daysDrinks = drinks.filter(
        (drink) => drink.timestamp >= dayStart && drink.timestamp < dayEnd
      );

      stats.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: daysDrinks.length,
        metTarget: daysDrinks.length >= target,
      });
    }
    return stats;
  }, [drinks, target]);

  const totalGlasses = drinks.length;
  const daysMetTarget = data.filter(d => d.metTarget).length;

  return (
    <div className="h-full pt-10 pb-32 px-6 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold text-md3-onSurface mb-8 tracking-tight">History Report</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-[28px] shadow-sm border border-md3-surfaceVariant flex flex-col items-center">
          <div className="p-3 bg-md3-primaryContainer text-md3-onPrimaryContainer rounded-2xl mb-3">
            <Trophy size={24} />
          </div>
          <span className="text-3xl font-black text-md3-onSurface">{daysMetTarget}</span>
          <span className="text-[10px] text-md3-secondary font-bold uppercase tracking-widest mt-1 text-center">Goal Streaks</span>
        </div>
        <div className="bg-white p-5 rounded-[28px] shadow-sm border border-md3-surfaceVariant flex flex-col items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3">
            <CalendarCheck size={24} />
          </div>
          <span className="text-3xl font-black text-md3-onSurface">{totalGlasses}</span>
          <span className="text-[10px] text-md3-secondary font-bold uppercase tracking-widest mt-1 text-center">Total Intake</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-md3-surfaceVariant mb-8 h-80 relative overflow-hidden">
        <h3 className="text-xs font-black text-md3-outline mb-6 uppercase tracking-widest flex items-center gap-2">
          <Droplet size={14} className="text-md3-primary" />
          Last 30 Days Activity
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="colorMet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0061a4" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#00467a" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorUnmet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d1e4ff" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#d1e4ff" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9, fill: '#73777f', fontWeight: 'bold' }} 
                interval={5}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 16px -2px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
              />
              <ReferenceLine y={target} stroke="#0061a4" strokeDasharray="5 5" strokeOpacity={0.3} />
              <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={8}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.metTarget ? 'url(#colorMet)' : 'url(#colorUnmet)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-md3-onSurface uppercase tracking-widest ml-1">Recent Activity</h3>
        {drinks.length === 0 ? (
          <div className="py-12 text-center text-md3-outline italic text-sm">
            No logs found yet. Start tracking!
          </div>
        ) : (
          drinks.slice().reverse().slice(0, 10).map(drink => (
            <div key={drink.id} className="flex justify-between items-center p-5 bg-white rounded-3xl border border-md3-surfaceVariant transition-all active:scale-95">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-md3-primaryContainer rounded-full"></div>
                <div>
                  <p className="font-bold text-md3-onSurface">Glass of Water</p>
                  <p className="text-[10px] font-bold text-md3-outline uppercase tracking-wider">
                    {new Date(drink.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(drink.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="bg-md3-primaryContainer text-md3-onPrimaryContainer px-3 py-1 rounded-full text-xs font-black">
                +1
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
