import React, { useState, useEffect } from 'react';
import { Target, Info, Download, Smartphone, Check, Share, MoreVertical, Database, Trash2, Cloud, RefreshCw, Key, Copy } from 'lucide-react';
import { clearAllData } from '../utils/storage';
import { generateSyncId } from '../utils/sync';

interface SettingsProps {
  target: number;
  setTarget: (t: number) => void;
  totalRecords: number;
  syncId: string | null;
  onSetSyncId: (id: string | null) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ target, setTarget, totalRecords, syncId, onSetSyncId }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPreviewEnv, setIsPreviewEnv] = useState(false);
  const [inputSyncId, setInputSyncId] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

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
    if (window.confirm("Are you sure? This will delete local and cloud links.")) {
      clearAllData();
    }
  };

  const handleCreateSync = () => {
    const newId = generateSyncId();
    onSetSyncId(newId);
  };

  const handleJoinSync = () => {
    if (inputSyncId.length < 4) return;
    onSetSyncId(inputSyncId.toUpperCase());
    setInputSyncId('');
    window.location.reload(); // Force reload to pull new cloud data
  };

  const copyToClipboard = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="h-full pt-10 px-6 max-w-md mx-auto w-full overflow-y-auto pb-24 no-scrollbar">
      <h2 className="text-2xl font-bold text-md3-onSurface mb-8">Settings</h2>

      {/* Cloud Sync Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-md3-surfaceVariant mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Cloud size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-md3-onSurface">Cloud Sync</h3>
            <p className="text-sm text-md3-secondary">Sync across computers</p>
          </div>
        </div>

        {syncId ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Your Sync Key</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-black text-md3-primary tracking-widest">{syncId}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  {copyFeedback ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                Enter this key on another device to share your progress.
              </p>
            </div>
            <button 
              onClick={() => onSetSyncId(null)}
              className="w-full py-2 text-xs text-red-500 font-semibold uppercase tracking-widest"
            >
              Disable Sync
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={handleCreateSync}
              className="w-full flex items-center justify-center gap-2 bg-md3-primary text-white py-3 rounded-xl font-bold shadow-sm"
            >
              <RefreshCw size={18} />
              Generate Sync Key
            </button>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold uppercase">or join</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Enter Key"
                value={inputSyncId}
                onChange={(e) => setInputSyncId(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 font-mono text-center tracking-widest"
              />
              <button 
                onClick={handleJoinSync}
                className="bg-md3-primaryContainer text-md3-onPrimaryContainer p-3 rounded-xl font-bold"
              >
                <Key size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Target Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-md3-surfaceVariant mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-md3-primaryContainer rounded-full text-md3-onPrimaryContainer">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-md3-onSurface">Daily Target</h3>
            <p className="text-sm text-md3-secondary">Glasses per day</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-md3-surface rounded-xl p-2 border border-md3-surfaceVariant">
          <button 
            onClick={() => setTarget(Math.max(1, target - 1))}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-md3-primary transition-colors font-bold text-xl"
          >
            -
          </button>
          <span className="text-3xl font-black text-md3-onSurface">{target}</span>
          <button 
            onClick={() => setTarget(target + 1)}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-md3-primary transition-colors font-bold text-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-md3-surfaceVariant mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-md3-secondary/10 rounded-full text-md3-secondary">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-md3-onSurface">Storage</h3>
            <p className="text-sm text-md3-secondary">Local device stats</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-md3-surfaceVariant">
            <span className="text-sm text-md3-onSurfaceVariant font-medium">Records</span>
            <span className="text-sm font-bold text-md3-primary">{totalRecords} drinks</span>
          </div>
          <button 
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Reset All Data
          </button>
        </div>
      </div>

      {/* PWA Install Section */}
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-md3-surfaceVariant mb-6 ${isPreviewEnv && !isInstalled ? 'opacity-75 grayscale-[0.3]' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${isInstalled ? 'bg-green-100 text-green-600' : 'bg-md3-primaryContainer text-md3-onPrimaryContainer'}`}>
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-md3-onSurface">App Install</h3>
            <p className="text-sm text-md3-secondary">
              {isInstalled ? 'Installed' : 'Add to Home Screen'}
            </p>
          </div>
        </div>

        {isInstalled ? (
           <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
              <Check size={20} />
              <span className="font-medium text-sm">Native Mode Active</span>
           </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-md3-primary text-md3-onPrimary py-3 px-4 rounded-xl font-semibold shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Download size={20} />
            Install App
          </button>
        ) : (
          <div className="bg-md3-surface p-4 rounded-xl border border-md3-surfaceVariant text-sm text-md3-onSurfaceVariant">
            <p className="mb-2 font-bold text-md3-onSurface">Manual Install:</p>
            {isIOS ? (
              <div className="flex items-start gap-3">
                <Share size={20} className="text-blue-500 mt-0.5" />
                <span>Tap <span className="font-semibold">Share</span> then <span className="font-semibold">Add to Home Screen</span>.</span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MoreVertical size={20} className="text-md3-secondary mt-0.5" />
                <span>Open browser menu (⋮) and select <span className="font-semibold">Add to Home Screen</span>.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-md3-primaryContainer/30 rounded-2xl p-6 border border-md3-primaryContainer">
        <div className="flex gap-3">
          <Info className="text-md3-primary shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-md3-onPrimaryContainer mb-1">How Sync Works</h4>
            <p className="text-sm text-md3-onSurfaceVariant leading-relaxed">
              Your data is encrypted and saved to a cloud bin. Use your Sync Key to load your data on a laptop, tablet, or another phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
