import React from 'react';
import { Settings, Shield, Cpu, Activity } from 'lucide-react';
import { JarvisStatus } from '../types';

interface NavbarProps {
  activeTab: 'hud' | 'device' | 'code' | 'apk' | 'daemon' | 'analytics';
  setActiveTab: (tab: 'hud' | 'device' | 'code' | 'apk' | 'daemon' | 'analytics') => void;
  status: JarvisStatus;
  onOpenSettings: () => void;
  backgroundDaemonActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  status,
  onOpenSettings,
  backgroundDaemonActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#050811]/90 backdrop-blur-md border-b border-sky-950/60 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-base md:text-lg font-bold tracking-wider text-slate-100 uppercase whitespace-nowrap font-mono">
            JARVIS <span className="text-sky-400 font-normal">CORE</span>
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="flex items-center gap-1 md:gap-2 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('hud')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'hud'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HUD Core
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'device'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phone Control
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'code'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Code Studio
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'apk'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            APK Builder
          </button>
          <button
            onClick={() => setActiveTab('daemon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'daemon'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Automation Daemon
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry & Stats
          </button>
        </nav>

        {/* Zone 3: Primary Action & System Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1.5 bg-slate-900/40 rounded-lg border border-slate-800">
            <span className="text-slate-500">Status:</span>
            <span
              className={
                status === 'listening'
                  ? 'text-amber-400'
                  : status === 'speaking'
                  ? 'text-emerald-400'
                  : status === 'processing'
                  ? 'text-sky-400'
                  : 'text-slate-300'
              }
            >
              {status.toUpperCase()}
            </span>
            {backgroundDaemonActive && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-sky-400 text-[11px]">BG DAEMON ACTIVE</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Configure API and Voice settings"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
