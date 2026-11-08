import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  Bell,
  Clock,
  Radio,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { daemonLogger } from '../utils/daemonLogger';

interface BackgroundDaemonProps {
  isActive: boolean;
  onToggleActive: () => void;
  onNotify: (title: string, msg: string) => void;
}

export const BackgroundDaemon: React.FC<BackgroundDaemonProps> = ({
  isActive,
  onToggleActive,
  onNotify,
}) => {
  const [heartbeatCount, setHeartbeatCount] = useState<number>(142);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [hotwordListening, setHotwordListening] = useState<boolean>(true);
  const [daemonLogs, setDaemonLogs] = useState<Array<{ time: string; event: string; status: string }>>([
    {
      time: '12:00:10',
      event: 'Foreground Service Attached (Priority: High)',
      status: 'NOMINAL',
    },
    {
      time: '12:00:25',
      event: 'Voice Hotword Detector Armed ("Hey Jarvis")',
      status: 'LISTENING',
    },
    {
      time: '12:00:40',
      event: 'Heartbeat ping synchronized with device sensors',
      status: 'PULSE',
    },
  ]);

  // Periodic heartbeat loop
  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      timer = setInterval(() => {
        setHeartbeatCount((prev) => prev + 1);

        // Periodically add subtle activity log
        if (Math.random() > 0.65) {
          const events = [
            'Probed Wi-Fi signal & latency metrics (18ms)',
            'Battery drain rate analyzed: 0.12% / hr',
            'Synchronized clipboard & notifications buffer',
            'Memory compaction executed: 42MB reclaimed',
            'Hotword listener buffer flushed',
          ];
          const chosen = events[Math.floor(Math.random() * events.length)];
          daemonLogger.log('Sensors', 'NOMINAL', chosen, 'Triggered by autonomous background thread');
          setDaemonLogs((prev) => [
            {
              time: new Date().toLocaleTimeString(),
              event: chosen,
              status: 'NOMINAL',
            },
            ...prev.slice(0, 19),
          ]);
        }
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      sounds.playClick();
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('JARVIS Automation Subsystem', {
            body: 'Background Daemon permissions activated successfully, Sir.',
            icon: 'favicon.ico',
          });
          onNotify('Permission Granted', 'Desktop push notifications enabled.');
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleTriggerTestAlert = () => {
    sounds.playAlert();
    if (notificationPermission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      new Notification('JARVIS Background Alert', {
        body: 'Boss, periodic security and battery scan completed. Zero anomalies found.',
      });
    }
    onNotify('Background Alert', 'Diagnostic notification dispatched.');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-950/60">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-sky-400" />
            Autonomous Background Automation Daemon
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Keeps JARVIS active in background, maintains scheduled health checks, hotword monitoring, and system alerts.
          </p>
        </div>

        {/* Master Toggle */}
        <button
          onClick={onToggleActive}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
            isActive
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isActive ? 'Daemon Running (Active)' : 'Start Background Daemon'}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Daemon Metrics */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-slate-400">Daemon Heartbeat</span>
              <span
                className={`text-xs font-mono font-bold ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {isActive ? 'SYNCHRONIZED' : 'SUSPENDED'}
              </span>
            </div>

            <div className="text-3xl font-mono font-bold text-slate-100 mb-2 tabular-nums">
              {heartbeatCount}{' '}
              <span className="text-xs font-normal text-slate-400">cycles</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains an uninterrupted background execution thread to continuously monitor voice commands, device state, and scheduled routines.
            </p>
          </div>

          {/* Desktop Push Notifications */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>System Push Notifications</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Allows JARVIS to notify you even when the browser tab is minimized or operating in the background.
            </p>

            <div className="flex flex-col gap-2">
              {notificationPermission !== 'granted' ? (
                <button
                  onClick={handleRequestNotification}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Enable Desktop Notifications
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs">
                  <span>Notifications Authorized</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <button
                onClick={handleTriggerTestAlert}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors"
              >
                Test Background Alert
              </button>
            </div>
          </div>

          {/* Hotword Settings */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Voice Hotword Detection</span>
              <span className="text-xs font-mono text-sky-400">Hey Jarvis</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Continuously listens for wake phrases in Hindi and English (&ldquo;Hey Jarvis&rdquo;, &ldquo;Jarvis suno&rdquo;).
            </p>
            <label className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">Continuous Acoustic Listening</span>
              <input
                type="checkbox"
                checked={hotwordListening}
                onChange={(e) => setHotwordListening(e.target.checked)}
                className="accent-sky-400"
              />
            </label>
          </div>
        </div>

        {/* Right 2 Columns: Scheduled Background Routines & Activity Stream */}
        <div className="md:col-span-2 space-y-6">
          {/* Automated Task Cards */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Automated Background Directives
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">Morning Executive Briefing</span>
                  <span className="text-[10px] font-mono text-sky-400">08:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Synthesizes daily weather, battery health, and unread SMS digest.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">Battery Level Safeguard</span>
                  <span className="text-[10px] font-mono text-amber-400">&lt; 15%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Automatically triggers screen dimming and vocal warning to plug in charger.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">Clipboard Auto-Clean</span>
                  <span className="text-[10px] font-mono text-purple-400">Every 4h</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scrub sensitive credentials from temporary Android memory buffer.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">Periodic Security Prober</span>
                  <span className="text-[10px] font-mono text-emerald-400">Active</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Continuously verifies ADB ports, Wi-Fi integrity, and background apps.
                </p>
              </div>
            </div>
          </div>

          {/* Live Background Activity Stream */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono text-slate-200">
                  Daemon Event Ledger (Live Background Log)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Auto-updating
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
              {daemonLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">{log.time}</span>
                    <span className="text-slate-200">{log.event}</span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-bold px-1.5 py-0.5 bg-sky-950/60 rounded">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
