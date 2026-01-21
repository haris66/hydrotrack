import React, { useMemo } from 'react';
import { DrinkRecord, DailyStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CalendarCheck, Trophy } from 'lucide-react';

interface HistoryProps {
  drinks: DrinkRecord[];
  target: number;
}

export const HistoryPage: React.FC<HistoryProps> = ({ drinks, target }) => {
  const data = useMemo(() => {
    const stats: DailyStat[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
    <div className="h-full pt-10 pb-24 px-6 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">History Report</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="p-2 bg-water-100 text-water-600 rounded-full mb-2">
            <Trophy size={20} />
          </div>
          <span className="text-2xl font-bold text-slate-800">{daysMetTarget}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide">Days Goal Met</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-full mb-2">
            <CalendarCheck size={20} />
          </div>
          <span className="text-2xl font-bold text-slate-800">{totalGlasses}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide">Total Glasses</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 h-80">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 ml-2">Last 30 Days</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorMet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                <stop offset="100%" stopColor="#0284c7" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="colorUnmet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity={1}/>
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              interval={4}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 'dataMax + 2']} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <ReferenceLine y={target} stroke="#7dd3fc" strokeDasharray="3 3" />
            <Bar dataKey="count" radius={[4, 4, 4, 4]}>
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

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Recent Logs</h3>
        {drinks.slice().reverse().slice(0, 5).map(drink => (
          <div key={drink.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-water-400 rounded-full"></div>
              <div>
                <p className="font-medium text-slate-700">Glass of Water</p>
                <p className="text-xs text-slate-400">
                  {new Date(drink.timestamp).toLocaleDateString()} • {new Date(drink.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-water-600">+1</span>
          </div>
        ))}
      </div>
    </div>
  );
};