import React, { useState } from 'react';
import {
  Smartphone,
  Lock,
  Unlock,
  Battery,
  BatteryCharging,
  Zap,
  Volume2,
  VolumeX,
  MapPin,
  Clipboard,
  MessageSquare,
  Phone,
  Terminal,
  Send,
  Wifi,
  Bluetooth,
  Copy,
  Check,
} from 'lucide-react';
import { DeviceState } from '../types';
import { sounds } from '../utils/soundEffects';

interface DeviceBridgeProps {
  deviceState: DeviceState;
  setDeviceState: React.Dispatch<React.SetStateAction<DeviceState>>;
  onNotify: (title: string, msg: string) => void;
}

export const DeviceBridge: React.FC<DeviceBridgeProps> = ({
  deviceState,
  setDeviceState,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'terminal' | 'sms' | 'dialer'>('controls');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsText, setSmsText] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [shellCmd, setShellCmd] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ cmd: string; output: string; time: string }>>([
    {
      cmd: 'adb shell getprop ro.build.version.release',
      output: '14.0 (Android 14 UpsideDownCake)',
      time: '12:00:01',
    },
    {
      cmd: 'adb shell dumpsys battery',
      output: 'Current Battery: 88%\nAC powered: false\nUSB powered: true\nWireless powered: false\nStatus: Charging\nHealth: Good',
      time: '12:00:05',
    },
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Toggle phone lock
  const handleToggleLock = () => {
    sounds.playConfirm();
    setDeviceState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
    onNotify('Device Security', deviceState.isLocked ? 'Phone screen unlocked' : 'Phone display locked by JARVIS');
  };

  // Toggle flashlight
  const handleToggleFlashlight = () => {
    sounds.playClick();
    setDeviceState((prev) => ({ ...prev, flashlightOn: !prev.flashlightOn }));
  };

  // Trigger real vibration
  const handleTriggerVibrate = (ms: number = 400) => {
    sounds.playConfirm();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        console.warn('Vibration API not allowed in this context');
      }
    }
    onNotify('Haptic Pulse', `Device vibrated for ${ms}ms`);
  };

  // Trigger real Geolocation lookup
  const handleScanLocation = () => {
    sounds.playScan();
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceState((prev) => ({
            ...prev,
            currentLocation: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            },
          }));
          onNotify('GPS Telemetry Locked', `Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          console.warn('GPS lookup fallback', err);
          setDeviceState((prev) => ({
            ...prev,
            currentLocation: { lat: 28.6139, lng: 77.2090, accuracy: 12 },
          }));
          onNotify('GPS Fixed (Simulated)', 'Coordinates: 28.6139, 77.2090 (Delhi Sector)');
        }
      );
    }
  };

  // Read or set clipboard
  const handleSyncClipboard = async () => {
    sounds.playClick();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setDeviceState((prev) => ({ ...prev, clipboardText: text }));
          onNotify('Clipboard Sync', `Synchronized: "${text.slice(0, 30)}..."`);
          return;
        }
      } catch (e) {
        // Fallback
      }
    }
    setDeviceState((prev) => ({ ...prev, clipboardText: 'JARVIS-SECURE-KEY-ALPHA' }));
    onNotify('Clipboard Sync', 'Clipboard synchronized with device buffer');
  };

  // Send SMS
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsNumber || !smsText) return;
    sounds.playConfirm();
    const newLog = {
      id: Date.now().toString(),
      number: smsNumber,
      message: smsText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setDeviceState((prev) => ({
      ...prev,
      smsLog: [newLog, ...prev.smsLog],
    }));
    onNotify('SMS Dispatched', `Message sent to ${smsNumber}`);
    setSmsText('');
  };

  // Place Call
  const handleInitiateCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNumber) return;
    sounds.playWakeChime();
    setActiveCall(callNumber);
    const newCall = {
      id: Date.now().toString(),
      number: callNumber,
      duration: 'Ongoing',
      timestamp: new Date().toLocaleTimeString(),
    };
    setDeviceState((prev) => ({
      ...prev,
      callLog: [newCall, ...prev.callLog],
    }));
    onNotify('Call Placed', `Dialing ${callNumber}...`);
  };

  // Execute ADB / Termux Shell command
  const handleExecuteShell = (cmdToRun?: string) => {
    const cmd = cmdToRun || shellCmd;
    if (!cmd.trim()) return;
    sounds.playClick();

    let output = 'Command executed successfully.';
    const lower = cmd.toLowerCase();

    if (lower.includes('keyevent 26')) {
      output = '[ADB] Key event 26 dispatched (Power Button / Screen Lock toggle)';
      setDeviceState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
    } else if (lower.includes('battery')) {
      output = `level: ${deviceState.batteryLevel}\nscale: 100\nvoltage: 4180mV\ntemperature: 29.5C\ntechnology: Li-poly\nstatus: ${deviceState.isCharging ? 'Charging' : 'Discharging'}`;
    } else if (lower.includes('packages')) {
      output = 'package:com.whatsapp\npackage:com.google.android.youtube\npackage:com.android.chrome\npackage:com.termux\npackage:com.jarvis.customapp';
    } else if (lower.includes('screencap')) {
      output = 'Saved 1080x2400 PNG frame to /sdcard/jarvis_screencap.png';
    } else if (lower.includes('vibrate')) {
      output = 'Dispatched 300ms haptic waveform to hardware actuator';
      handleTriggerVibrate(300);
    } else {
      output = `[PID ${Math.floor(Math.random() * 8000 + 1000)}] exit_code: 0, stdout buffered.`;
    }

    setTerminalLogs((prev) => [
      { cmd, output, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
    setShellCmd('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-950/60">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-sky-400" />
            Android Device & Subsystem Controller
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real Web API integrations, phone hardware simulator, and ADB/Termux shell automation bridge.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'controls' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hardware Hub
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'terminal' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ADB Shell Console
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'sms' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMS Dispatcher
          </button>
          <button
            onClick={() => setActiveTab('dialer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'dialer' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Dialer
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Phone Mockup Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <span className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider">
              Simulated Device Display
            </span>
            <div
              className={`relative w-64 h-[440px] rounded-3xl border-4 transition-all duration-300 flex flex-col justify-between p-4 shadow-2xl overflow-hidden ${
                deviceState.isLocked
                  ? 'border-slate-800 bg-slate-950 text-slate-500'
                  : 'border-sky-500/40 bg-radial from-slate-900 via-[#071329] to-[#040813] text-slate-100'
              }`}
            >
              {/* Flashlight beam simulator */}
              {deviceState.flashlightOn && (
                <div className="absolute inset-0 bg-yellow-300/15 pointer-events-none animate-pulse" />
              )}

              {/* Top Notch & Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono opacity-80 pt-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto" />
                <div className="flex items-center gap-1">
                  <span>{deviceState.batteryLevel}%</span>
                  {deviceState.isCharging ? (
                    <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  ) : (
                    <Battery className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {/* Central Phone Screen Content */}
              {deviceState.isLocked ? (
                <div className="flex flex-col items-center justify-center my-auto text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <Lock className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Device Locked</span>
                  <span className="text-[11px] text-slate-500 mt-1">Secured by JARVIS Defense</span>
                  <button
                    onClick={handleToggleLock}
                    className="mt-4 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                  >
                    Tap to Unlock
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto text-center">
                  <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-400 mb-3 shadow-inner">
                    <Zap className="w-7 h-7" />
                  </div>
                  <span className="text-base font-bold text-slate-100">JARVIS Assistant</span>
                  <span className="text-xs text-sky-400 mt-0.5 font-mono">Status: Connected</span>

                  {deviceState.flashlightOn && (
                    <div className="mt-2 text-[11px] px-2.5 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-md border border-yellow-400/30">
                      Flashlight Active
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2 w-full text-[10px] font-mono text-slate-400">
                    <div className="p-1.5 bg-slate-800/60 rounded-lg">Vol: {deviceState.volume}%</div>
                    <div className="p-1.5 bg-slate-800/60 rounded-lg">GPS: {deviceState.currentLocation ? 'ON' : 'OFF'}</div>
                    <div className="p-1.5 bg-slate-800/60 rounded-lg">ADB: LIVE</div>
                  </div>
                </div>
              )}

              {/* Bottom Nav Pill */}
              <div className="w-24 h-1 bg-slate-600/80 rounded-full mx-auto pb-0.5 mb-1" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleToggleLock}
                className={`px-4 py-2 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
                  deviceState.isLocked
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {deviceState.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {deviceState.isLocked ? 'Unlock Screen' : 'Lock Screen (Power)'}
              </button>
            </div>
          </div>

          {/* Hardware Telemetry & Direct Switches (2 Columns) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Battery Controller */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  <span>Battery System</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                  {deviceState.batteryLevel}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={deviceState.batteryLevel}
                onChange={(e) =>
                  setDeviceState((prev) => ({ ...prev, batteryLevel: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <button
                  onClick={() =>
                    setDeviceState((prev) => ({ ...prev, isCharging: !prev.isCharging }))
                  }
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  {deviceState.isCharging ? 'Unplug Charger' : 'Connect Charger'}
                </button>
                <span>{deviceState.isCharging ? 'AC Rapid Charging' : 'On Battery'}</span>
              </div>
            </div>

            {/* Flashlight / Torch */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Hardware Flashlight</span>
                </div>
                <span
                  className={`text-xs font-mono font-semibold ${
                    deviceState.flashlightOn ? 'text-yellow-400' : 'text-slate-500'
                  }`}
                >
                  {deviceState.flashlightOn ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Toggles device optical torch diode for emergency illumination.
              </p>
              <button
                onClick={handleToggleFlashlight}
                className={`w-full py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  deviceState.flashlightOn
                    ? 'bg-yellow-400 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {deviceState.flashlightOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
              </button>
            </div>

            {/* Volume Control */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span>Audio Volume</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                  {deviceState.volume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deviceState.volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDeviceState((prev) => ({ ...prev, volume: val }));
                  sounds.playClick();
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    sounds.playConfirm();
                    setDeviceState((prev) => ({ ...prev, volume: 0 }));
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1"
                >
                  <VolumeX className="w-3 h-3" /> Mute
                </button>
                <button
                  onClick={() => {
                    sounds.playConfirm();
                    setDeviceState((prev) => ({ ...prev, volume: 100 }));
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Max (100%)
                </button>
              </div>
            </div>

            {/* Haptic Vibration Actuator */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Haptic Actuator (Vibrate)</span>
                </div>
                <span className="text-xs font-mono text-purple-400">Web Vibration API</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Sends high-precision vibration pulses to the device hardware.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerVibrate(200)}
                  className="flex-1 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  200ms Pulse
                </button>
                <button
                  onClick={() => handleTriggerVibrate(600)}
                  className="flex-1 py-2 text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg transition-colors"
                >
                  600ms Alarm
                </button>
              </div>
            </div>

            {/* GPS Telemetry */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Geospatial Coordinates</span>
                </div>
                <button
                  onClick={handleScanLocation}
                  className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-lg transition-colors"
                >
                  Scan Current GPS
                </button>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 flex flex-wrap gap-4">
                <span>
                  LAT: <strong className="text-sky-400">{deviceState.currentLocation?.lat.toFixed(6) || '28.613939'}</strong>
                </span>
                <span>
                  LNG: <strong className="text-sky-400">{deviceState.currentLocation?.lng.toFixed(6) || '77.209021'}</strong>
                </span>
                <span>
                  ACCURACY: <strong className="text-emerald-400">{deviceState.currentLocation?.accuracy || 15}m</strong>
                </span>
              </div>
            </div>

            {/* Clipboard Buffer */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Clipboard className="w-4 h-4 text-sky-400" />
                  <span>Clipboard System Stream</span>
                </div>
                <button
                  onClick={handleSyncClipboard}
                  className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Sync System Clipboard
                </button>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                <span className="truncate max-w-md">
                  {deviceState.clipboardText || 'Clipboard empty or not synchronized'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(deviceState.clipboardText);
                    sounds.playConfirm();
                    onNotify('Clipboard', 'Copied to system clipboard');
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 ml-2 shrink-0"
                >
                  Copy Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal ADB / Termux Shell Runner */}
      {activeTab === 'terminal' && (
        <div className="p-4 md:p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold font-mono text-slate-200">
                ADB Shell / Termux Command Engine
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-emerald-400">●</span> BRIDGE ACTIVE
            </div>
          </div>

          {/* Quick Command Suggestions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleExecuteShell('adb shell input keyevent 26')}
              className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-slate-300 transition-colors"
            >
              adb shell input keyevent 26
            </button>
            <button
              onClick={() => handleExecuteShell('termux-battery-status')}
              className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-slate-300 transition-colors"
            >
              termux-battery-status
            </button>
            <button
              onClick={() => handleExecuteShell('pm list packages -3')}
              className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-slate-300 transition-colors"
            >
              pm list packages -3
            </button>
            <button
              onClick={() => handleExecuteShell('termux-vibrate -d 300')}
              className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-slate-300 transition-colors"
            >
              termux-vibrate -d 300
            </button>
            <button
              onClick={() => handleExecuteShell('screencap /sdcard/shot.png')}
              className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-slate-300 transition-colors"
            >
              screencap
            </button>
          </div>

          {/* Terminal Output Screen */}
          <div className="h-64 overflow-y-auto bg-black/90 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
            {terminalLogs.map((item, idx) => (
              <div key={idx} className="border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <span>[{item.time}]</span>
                  <span>$ {item.cmd}</span>
                </div>
                <pre className="text-slate-300 mt-1 whitespace-pre-wrap pl-4 font-mono text-[11px]">
                  {item.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Command Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={shellCmd}
              onChange={(e) => setShellCmd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteShell()}
              placeholder="Enter ADB or Termux shell command (e.g. input keyevent 26, dumpsys wifi)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
            />
            <button
              onClick={() => handleExecuteShell()}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Run
            </button>
          </div>
        </div>
      )}

      {/* SMS Dispatcher Tab */}
      {activeTab === 'sms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              Compose & Dispatch SMS
            </h3>
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Recipient Number:</label>
                <input
                  type="tel"
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-sky-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Message Body:</label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Enter message text for JARVIS to transmit..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-sky-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" /> Send Direct SMS
              </button>
            </form>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span>SMS Transmission Log</span>
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {deviceState.smsLog.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 font-mono">
                  No SMS transmissions logged yet.
                </div>
              ) : (
                deviceState.smsLog.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400 font-mono mb-1">
                      <span>To: <strong className="text-sky-300">{log.number}</strong></span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-200">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Direct Dialer Tab */}
      {activeTab === 'dialer' && (
        <div className="max-w-md mx-auto p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Telephony Direct Call Interface
          </h3>
          <form onSubmit={handleInitiateCall} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Phone Number:</label>
              <input
                type="tel"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-slate-100 text-center tracking-widest focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>
            {/* Quick keypad */}
            <div className="grid grid-cols-3 gap-2 py-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCallNumber((prev) => prev + digit);
                  }}
                  className="py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl font-mono text-sm font-semibold text-slate-200 transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> Initiate Call
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCallNumber('');
                  setActiveCall(null);
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Clear
              </button>
            </div>
          </form>

          {activeCall && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-mono text-emerald-300 animate-pulse">
              Call active with {activeCall}...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
