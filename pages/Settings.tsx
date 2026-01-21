import React, { useState, useEffect } from 'react';
import { Target, Info, Download, Smartphone, Check, Share, Menu, MoreVertical, AlertTriangle, Globe } from 'lucide-react';

interface SettingsProps {
  target: number;
  setTarget: (t: number) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ target, setTarget }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPreviewEnv, setIsPreviewEnv] = useState(false);

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

  return (
    <div className="h-full pt-10 px-6 max-w-md mx-auto w-full overflow-y-auto pb-24 no-scrollbar">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Settings</h2>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-water-100 rounded-full text-water-600">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Daily Target</h3>
            <p className="text-sm text-slate-500">Glasses per day</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2">
          <button 
            onClick={() => setTarget(Math.max(1, target - 1))}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-water-600 transition-colors font-bold text-xl"
          >
            -
          </button>
          <span className="text-3xl font-black text-slate-800">{target}</span>
          <button 
            onClick={() => setTarget(target + 1)}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-water-600 transition-colors font-bold text-xl"
          >
            +
          </button>
        </div>
      </div>

      {isPreviewEnv && !isInstalled && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-6">
          <div className="flex gap-3 mb-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <h3 className="font-semibold text-amber-900">Why "Google AI Studio"?</h3>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed mb-4">
            You are currently viewing this app inside the code editor's preview. If you click "Install" now, your phone will install the <strong>Editor</strong>, not HydroTrack.
          </p>
          
          <div className="bg-white/50 rounded-xl p-4 border border-amber-100/50">
            <h4 className="font-semibold text-amber-900 text-sm mb-2 flex items-center gap-2">
              <Globe size={14} />
              To get the real app:
            </h4>
            <ol className="list-decimal list-outside text-sm text-amber-800 space-y-2 ml-4">
              <li>Export this code.</li>
              <li>Deploy it to a hosting provider (like Vercel, Netlify, or GitHub Pages).</li>
              <li>Open your <strong>new deployed URL</strong> on your phone.</li>
              <li>Install from there to get the correct icon and name.</li>
            </ol>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 transition-all ${isPreviewEnv ? 'opacity-75 grayscale-[0.3]' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${isInstalled ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">App Install</h3>
            <p className="text-sm text-slate-500">
              {isInstalled ? 'HydroTrack is installed' : 'Add to Home Screen'}
            </p>
          </div>
        </div>

        {isInstalled ? (
           <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
              <Check size={20} />
              <span className="font-medium text-sm">Installed & Ready</span>
           </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all"
          >
            <Download size={20} />
            Install App
          </button>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
            <p className="mb-2 font-medium text-slate-800">Install Manually:</p>
            {isIOS ? (
              <div className="flex items-start gap-3">
                <Share size={20} className="text-blue-500 mt-0.5" />
                <span>Tap <span className="font-semibold">Share</span> then select <span className="font-semibold">Add to Home Screen</span>.</span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MoreVertical size={20} className="text-slate-500 mt-0.5" />
                <span>Tap the browser menu (⋮) and select <span className="font-semibold">Add to Home Screen</span> or <span className="font-semibold">Install App</span>.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex gap-3">
          <Info className="text-blue-500 shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">About this App</h4>
            <p className="text-sm text-blue-600 leading-relaxed">
              HydroTrack is a Progressive Web App (PWA). It works offline and behaves like a native app once deployed.
            </p>
            <div className="mt-4 text-xs text-blue-400 font-mono">
              Version 1.0.4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};