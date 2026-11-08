import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Shield,
  Radio,
  Zap,
} from 'lucide-react';
import { DaemonLogEntry } from '../types';
import { daemonLogger } from '../utils/daemonLogger';
import { sounds } from '../utils/soundEffects';

interface DaemonLogOverlayProps {
  onNotify?: (title: string, msg: string) => void;
}

export const DaemonLogOverlay: React.FC<DaemonLogOverlayProps> = ({ onNotify }) => {
  const [logs, setLogs] = useState<DaemonLogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'NOMINAL' | 'PULSE' | 'WARN' | 'EXEC'>('ALL');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  // Subscribe to persistent daemon logger
  useEffect(() => {
    const unsubscribe = daemonLogger.subscribe((latestLogs) => {
      setLogs(latestLogs);
    });
    return () => unsubscribe();
  }, []);

  // Periodic automatic simulated background telemetry when not paused
  useEffect(() => {
    const timer = setInterval(() => {
      if (!daemonLogger.getIsPaused() && Math.random() > 0.4) {
        const sampleEvents: Array<{
          subsystem: DaemonLogEntry['subsystem'];
          level: DaemonLogEntry['level'];
          message: string;
          details: string;
        }> = [
          {
            subsystem: 'Power',
            level: 'PULSE',
            message: 'Battery level verified (Thermal: 29.1°C)',
            details: 'Discharge slope stable · Health: 99%',
          },
          {
            subsystem: 'Network',
            level: 'NOMINAL',
            message: 'Background keep-alive socket heartbeated',
            details: 'Encrypted tunnel intact · Ping: 16ms',
          },
          {
            subsystem: 'Sensors',
            level: 'NOMINAL',
            message: 'Haptic actuator calibration check completed',
            details: 'Actuator status: IDLE · Readiness: 100%',
          },
          {
            subsystem: 'Security',
            level: 'PULSE',
            message: 'Clipboard buffer integrity verified',
            details: 'Buffer scrubbed of transient auth tokens',
          },
          {
            subsystem: 'Voice',
            level: 'NOMINAL',
            message: 'Acoustic hotword background buffer synchronized',
            details: 'Noise floor: -48dB · Zero clipping',
          },
        ];

        const chosen = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
        daemonLogger.log(chosen.subsystem, chosen.level, chosen.message, chosen.details);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Filtered log entries
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === '' ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subsystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
      const matchesSubsystem = selectedSubsystem === 'ALL' || log.subsystem === selectedSubsystem;

      return matchesSearch && matchesLevel && matchesSubsystem;
    });
  }, [logs, searchQuery, selectedLevel, selectedSubsystem]);

  const handleTogglePause = () => {
    sounds.playClick();
    const nextState = !isPaused;
    setIsPaused(nextState);
    daemonLogger.setPaused(nextState);
    onNotify?.('Daemon Logger', nextState ? 'Log stream paused' : 'Log stream resumed');
  };

  const handleClear = () => {
    sounds.playClick();
    daemonLogger.clear();
    onNotify?.('Daemon Logs', 'Operation log buffer cleared');
  };

  const handleCopyLogs = () => {
    sounds.playConfirm();
    const formatted = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.subsystem}] ${l.message} ${l.details ? `(${l.details})` : ''}`)
      .join('\n');
    navigator.clipboard?.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.('Logs Copied', 'All filtered daemon logs copied to clipboard');
  };

  const handleDispatchManualProbe = () => {
    sounds.playScan();
    daemonLogger.log('Sensors', 'EXEC', 'Manual Subsystem Diagnostic Triggered by User', 'Verified all 6 core hardware channels');
    onNotify?.('Diagnostic Triggered', 'Manual telemetry probe logged.');
  };

  return (
    <aside aria-label="Daemon system log overlay" className="fixed bottom-4 right-4 z-40 font-mono text-xs select-none">
      {/* Collapsed Pill View */}
      {!isExpanded ? (
        <button
          onClick={() => {
            sounds.playClick();
            setIsExpanded(true);
          }}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-[#070d1c]/95 hover:bg-[#0c1630] border border-sky-500/40 hover:border-sky-400/80 rounded-2xl shadow-2xl backdrop-blur-md text-slate-200 transition-all duration-200"
          title="Open persistent background daemon log overlay"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
          </div>
          <span className="font-bold text-sky-300 tracking-wider">
            DAEMON LOG <span className="text-slate-400 font-normal">({logs.length})</span>
          </span>
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest hidden sm:inline">
            NOMINAL
          </span>
          <ChevronUp className="w-4 h-4 text-sky-400 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      ) : (
        /* Expanded Floating Window */
        <div className="w-[340px] sm:w-[460px] md:w-[500px] h-[440px] bg-[#070d1c]/95 border border-sky-500/40 rounded-3xl shadow-2xl backdrop-blur-lg flex flex-col overflow-hidden animate-fade-in">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-sky-950/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-100 text-xs tracking-wider">
                BACKGROUND DAEMON OVERLAY
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {logs.length} ops
              </span>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleTogglePause}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title={isPaused ? 'Resume live logging' : 'Pause live logging'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleCopyLogs}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
                title="Copy filtered logs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleClear}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
                title="Clear log buffer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsExpanded(false);
                }}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
                title="Collapse window"
              >
                <ChevronDown className="w-4 h-4 text-sky-400" />
              </button>
            </div>
          </div>

          {/* Search & Level Filter Strip */}
          <div className="p-2.5 bg-slate-950/60 border-b border-slate-900 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter operations or subsystem..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <select
                value={selectedSubsystem}
                onChange={(e) => setSelectedSubsystem(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-hidden focus:border-sky-500"
              >
                <option value="ALL">All Subsystems</option>
                <option value="Sensors">Sensors</option>
                <option value="Network">Network</option>
                <option value="Power">Power</option>
                <option value="Voice">Voice</option>
                <option value="Security">Security</option>
                <option value="ADB">ADB</option>
                <option value="APK">APK</option>
              </select>
            </div>

            {/* Level Quick Badges */}
            <div className="flex items-center gap-1">
              {(['ALL', 'NOMINAL', 'PULSE', 'WARN', 'EXEC'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedLevel(lvl);
                  }}
                  className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
              <button
                onClick={handleDispatchManualProbe}
                className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-md transition-colors flex items-center gap-1"
                title="Send manual test probe"
              >
                <Zap className="w-2.5 h-2.5" />
                Probe
              </button>
            </div>
          </div>

          {/* Scrollable Log Feed */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 text-[11px] divide-y divide-slate-900/60">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No daemon operations match the current filter.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isWarn = log.level === 'WARN';
                const isPulse = log.level === 'PULSE';
                const isExec = log.level === 'EXEC';

                return (
                  <div key={log.id} className="pt-1.5 first:pt-0">
                    <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-sky-400">{log.subsystem}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          isWarn
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isPulse
                            ? 'bg-sky-500/20 text-sky-300'
                            : isExec
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {log.level}
                      </span>
                    </div>

                    <div className="text-slate-200 leading-snug">{log.message}</div>

                    {log.details && (
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {log.details}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Window Footer Status */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {isPaused ? 'Logging Paused' : 'Live Autonomous Daemon Active'}
            </span>
            <span>Auto-buffer retention: 200 items</span>
          </div>
        </div>
      )}
    </aside>
  );
};
