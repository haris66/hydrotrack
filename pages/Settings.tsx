
import React, { useState, useEffect } from 'react';
/* Added missing Plus and Minus imports */
import { Target, Info, Download, Smartphone, Check, Share, MoreVertical, Database, Trash2, Cloud, RefreshCw, Key, Copy, CloudOff, AlertCircle, Clock, Loader2, XCircle, Minus, Plus } from 'lucide-react';
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
    
    const drinks = getStoredDrinks();
    const targetVal = getStoredTarget();
    
    const result = await createCloudBin({
      drinks,
      target: targetVal,
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

  const lastError = syncLogs.find(l => l.status === 'error');

  return (
    <div className="h-full pt-10 px-6 max-w-md mx-auto w-full overflow-y-auto pb-24 no-scrollbar">
      <h2 className="text-2xl font-bold text-md3-onSurface mb-8 tracking-tight">Settings</h2>

      {/* Cloud Sync Section */}
      <div className="bg-md3-primary rounded-[28px] p-6 shadow-lg mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cloud size={120} />
        </div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
            {syncId ? <Cloud size={24} /> : <CloudOff size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold">Cloud Sync</h3>
            <p className="text-xs text-blue-100 opacity-80">Continuous data backup</p>
          </div>
        </div>

        {syncId ? (
          <div className="space-y-4 relative z-10">
            {/* Last Error Display */}
            {lastError && (
              <div className="bg-red-500/20 border border-red-400/30 p-3 rounded-xl flex items-start gap-2">
                <XCircle size={16} className="text-red-200 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-100">Sync Error Detected</p>
                  <p className="text-xs leading-tight text-red-50 mt-1">{lastError.message}</p>
                </div>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] text-blue-100 uppercase font-black mb-1 tracking-widest">Active Session ID</p>
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

            <div className="pt-2 space-y-2">
              <button 
                onClick={onManualSync}
                className="w-full py-4 bg-white text-md3-primary rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
              >
                <RefreshCw size={16} /> Force Cloud Update
              </button>

              <button 
                onClick={() => onSetSyncId(null)}
                className="w-full py-2.5 text-xs text-blue-100 font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Stop Syncing
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 relative z-10">
            <button 
              onClick={handleCreateSync}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 bg-white text-md3-primary py-4 rounded-2xl font-black shadow-md active:scale-95 transition-all disabled:opacity-70"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
              {isGenerating ? 'CONNECTING...' : 'SETUP CLOUD SYNC'}
            </button>
            
            {genError && (
               <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-100 shrink-0" />
                  <span className="text-xs text-red-50 font-medium leading-tight">{genError}</span>
               </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/20"></div>
              <span className="text-[10px] font-black uppercase text-blue-100 tracking-tighter">Existing session</span>
              <div className="h-[1px] flex-1 bg-white/20"></div>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="ID CODE"
                value={inputSyncId}
                onChange={(e) => setInputSyncId(e.target.value)}
                className="flex-1 bg-white/10 border border-white/30 rounded-2xl px-4 py-3 font-mono text-center text-xs tracking-widest placeholder:text-blue-100 focus:outline-none"
              />
              <button 
                onClick={handleJoinSync}
                className="bg-white text-md3-primary p-4 rounded-2xl font-bold shadow-md active:scale-90"
              >
                <Key size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Target Management */}
      <div className="bg-white rounded-[28px] p-6 shadow-sm border border-md3-surfaceVariant mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-md3-primaryContainer rounded-2xl text-md3-onPrimaryContainer">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-md3-onSurface">Daily Target</h3>
            <p className="text-sm text-md3-secondary">Goal glasses per day</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-md3-surface rounded-2xl p-2 border border-md3-surfaceVariant">
          <button 
            onClick={() => setTarget(Math.max(1, target - 1))}
            className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-md3-primary transition-all active:scale-90 font-black text-2xl"
          >
            <Minus size={24} />
          </button>
          <span className="text-3xl font-black text-md3-onSurface">{target}</span>
          <button 
            onClick={() => setTarget(target + 1)}
            className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-md3-primary transition-all active:scale-90 font-black text-2xl"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Data Clear */}
      <button 
        onClick={handleClearData}
        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-100 py-4 rounded-2xl text-sm font-black uppercase tracking-widest active:scale-95 transition-all mb-8"
      >
        <Trash2 size={16} />
        Wipe All Local Data
      </button>

      <div className="bg-md3-surfaceVariant/30 rounded-[28px] p-6 border border-md3-surfaceVariant text-center text-[10px] text-md3-outline font-bold uppercase tracking-widest">
        HydroTrack PWA • Version 1.1.2
      </div>
    </div>
  );
};
