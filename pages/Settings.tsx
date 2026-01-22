import React, { useState, useEffect } from 'react';
import { Target, Info, Download, Smartphone, Check, Share, MoreVertical, Database, Trash2, Cloud, RefreshCw, Key, Copy, CloudOff, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { clearAllData, getStoredDrinks, getStoredTarget } from '../utils/storage';
import { createCloudBin } from '../utils/sync';
import { SyncLog } from '../types';

interface SettingsProps {
  target: number;
  setTarget: (t: number) => void;
  totalRecords: number;
  syncId: string | null;
  onSetSyncId: (id: string | null) => void;
  syncLogs: SyncLog[];
  onClearLogs: () => void;
  onManualSync: () => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ 
  target, setTarget, totalRecords, syncId, onSetSyncId, syncLogs, onClearLogs, onManualSync 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPreviewEnv, setIsPreviewEnv] = useState(false);
  const [inputSyncId, setInputSyncId] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hostname.includes('google') || window.location.hostname.includes('webcontainer')) {
      setIsPreviewEnv(true);
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure? This will delete local progress AND disable cloud sync.")) {
      clearAllData();
    }
  };

  const handleCreateSync = async () => {
    setIsGenerating(true);
    setGenError(null);
    
    // Prepare initial data to upload
    const drinks = getStoredDrinks();
    const target = getStoredTarget();
    
    const result = await createCloudBin({
      drinks,
      target,
      updatedAt: Date.now()
    });

    setIsGenerating(false);

    if (result.success && result.data) {
      onSetSyncId(result.data);
    } else {
      setGenError(result.error || "Failed to generate key");
    }
  };

  const handleJoinSync = () => {
    if (inputSyncId.trim().length < 4) return;
    // Extract ID if user pasted a full URL
    let cleanId = inputSyncId.trim();
    if (cleanId.includes('/')) {
        cleanId = cleanId.substring(cleanId.lastIndexOf('/') + 1);
    }
    onSetSyncId(cleanId);
    setInputSyncId('');
    setTimeout(() => window.location.reload(), 500);
  };

  const copyToClipboard = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="h-full pt-10 px-6 max-w-md mx-auto w-full overflow-y-auto pb-24 no-scrollbar">
      <h2 className="text-2xl font-bold text-md3-onSurface mb-8 tracking-tight">Settings</h2>

      {/* Cloud Sync Section */}
      <div className="bg-blue-600 rounded-[28px] p-6 shadow-lg mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cloud size={120} />
        </div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
            {syncId ? <Cloud size={24} /> : <CloudOff size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold">Cloud Sync</h3>
            <p className="text-sm text-blue-100">Backup & Cross-device sync</p>
          </div>
        </div>

        {syncId ? (
          <div className="space-y-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] text-blue-100 uppercase font-black mb-1 tracking-widest">Your Private Sync Key</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold break-all leading-tight">{syncId}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-90 shrink-0"
                >
                  {copyFeedback ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Sync History List */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-100 flex items-center gap-2">
                  <Clock size={12} /> Sync History
                </span>
                {syncLogs.length > 0 && (
                  <button onClick={onClearLogs} className="text-[10px] font-black uppercase tracking-tighter hover:underline">Clear</button>
                )}
              </div>
              <div className="max-h-32 overflow-y-auto p-2 space-y-2 no-scrollbar">
                {syncLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-blue-200 italic">No operations yet</div>
                ) : (
                  syncLogs.map(log => (
                    <div key={log.id} className="flex gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="mt-0.5 shrink-0">
                        {log.status === 'success' ? <Check size={12} className="text-green-300" /> : 
                         log.status === 'error' ? <AlertCircle size={12} className="text-red-300" /> : 
                         <Info size={12} className="text-blue-200" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold leading-tight break-words">{log.message}</p>
                        <p className="text-[8px] opacity-60 font-mono mt-0.5">{formatTime(log.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button 
                onClick={onManualSync}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95"
              >
                <RefreshCw size={16} /> Sync Now
              </button>

              <button 
                onClick={() => onSetSyncId(null)}
                className="w-full py-2.5 text-xs text-blue-200 font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Disable Sync & Remove Key
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 relative z-10">
            <button 
              onClick={handleCreateSync}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 bg-white text-blue-600 py-4 rounded-2xl font-black shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
              {isGenerating ? 'GENERATING...' : 'GENERATE SYNC KEY'}
            </button>
            
            {genError && (
               <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-200 shrink-0" />
                  <span className="text-xs text-red-100 font-medium leading-tight">{genError}</span>
               </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/20"></div>
              <span className="text-[10px] font-black uppercase text-blue-100 tracking-tighter">Existing users</span>
              <div className="h-[1px] flex-1 bg-white/20"></div>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="ENTER KEY"
                value={inputSyncId}
                onChange={(e) => setInputSyncId(e.target.value)}
                className="flex-1 bg-white/10 border border-white/30 rounded-2xl px-4 py-3 font-mono text-center text-xs tracking-widest placeholder:text-blue-200 focus:outline-none focus:bg-white/20"
              />
              <button 
                onClick={handleJoinSync}
                className="bg-white text-blue-600 p-4 rounded-2xl font-bold shadow-md active:scale-90 transition-all"
              >
                <Key size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Target Section */}
      <div className="bg-white rounded-[28px] p-6 shadow-sm border border-md3-surfaceVariant mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-md3-primaryContainer rounded-2xl text-md3-onPrimaryContainer">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-md3-onSurface">Daily Target</h3>
            <p className="text-sm text-md3-secondary">Goal intake per day</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-md3-surface rounded-2xl p-2 border border-md3-surfaceVariant">
          <button 
            onClick={() => setTarget(Math.max(1, target - 1))}
            className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-md3-primary transition-all active:scale-90 font-black text-2xl"
          >
            -
          </button>
          <span className="text-3xl font-black text-md3-onSurface">{target}</span>
          <button 
            onClick={() => setTarget(target + 1)}
            className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-md3-primary transition-all active:scale-90 font-black text-2xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-[28px] p-6 shadow-sm border border-md3-surfaceVariant mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-md3-secondary/10 rounded-2xl text-md3-secondary">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-md3-onSurface">Local Storage</h3>
            <p className="text-sm text-md3-secondary">Device data statistics</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-md3-surfaceVariant">
            <span className="text-sm text-md3-onSurfaceVariant font-bold">Local Records</span>
            <span className="text-sm font-black text-md3-primary">{totalRecords} drinks</span>
          </div>
          <button 
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 size={16} />
            Reset All History
          </button>
        </div>
      </div>

      {/* PWA Install Section */}
      <div className={`bg-white rounded-[28px] p-6 shadow-sm border border-md3-surfaceVariant mb-6 ${isPreviewEnv && !isInstalled ? 'opacity-70 grayscale-[0.2]' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl ${isInstalled ? 'bg-green-100 text-green-600' : 'bg-md3-primaryContainer text-md3-onPrimaryContainer'}`}>
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-md3-onSurface">Native Experience</h3>
            <p className="text-sm text-md3-secondary">
              {isInstalled ? 'App is installed' : 'Install for offline use'}
            </p>
          </div>
        </div>

        {isInstalled ? (
           <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-2xl">
              <Check size={20} strokeWidth={3} />
              <span className="font-bold text-sm uppercase tracking-tight">System Optimized</span>
           </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-md3-primary text-md3-onPrimary py-4 px-4 rounded-2xl font-black shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Download size={20} />
            INSTALL ON DEVICE
          </button>
        ) : (
          <div className="bg-md3-surface p-4 rounded-2xl border border-md3-surfaceVariant text-sm text-md3-onSurfaceVariant">
            <p className="mb-2 font-bold text-md3-onSurface">How to Install:</p>
            {isIOS ? (
              <div className="flex items-start gap-3">
                <Share size={20} className="text-blue-500 mt-0.5 shrink-0" />
                <span>Tap <span className="font-black text-md3-primary">Share</span> then scroll to <span className="font-black text-md3-primary">Add to Home Screen</span>.</span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MoreVertical size={20} className="text-md3-secondary mt-0.5 shrink-0" />
                <span>Open <span className="font-black text-md3-primary">Menu</span> (3 dots) and select <span className="font-black text-md3-primary">Install App</span>.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-md3-primaryContainer/20 rounded-[28px] p-6 border border-md3-primaryContainer mb-4">
        <div className="flex gap-4">
          <Info className="text-md3-primary shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-md3-onPrimaryContainer mb-1 uppercase text-xs tracking-widest">About Sync</h4>
            <p className="text-xs text-md3-onSurfaceVariant leading-relaxed opacity-80">
              Cloud Sync encrypts your drink logs and targets. Sync ID keys are unique to you and should be kept private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
