import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, Shield, Zap, Lock, Smartphone, Terminal, Play } from 'lucide-react';
import { JarvisStatus } from '../types';
import { sounds } from '../utils/soundEffects';

interface JarvisCoreProps {
  status: JarvisStatus;
  isListening: boolean;
  onToggleVoice: () => void;
  onSubmitText: (text: string) => void;
  interimTranscript: string;
}

export const JarvisCore: React.FC<JarvisCoreProps> = ({
  status,
  isListening,
  onToggleVoice,
  onSubmitText,
  interimTranscript,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sounds.playClick();
      onSubmitText(inputText.trim());
      setInputText('');
    }
  };

  const handleQuickCommand = (cmd: string) => {
    sounds.playClick();
    onSubmitText(cmd);
  };

  // Status visual parameters
  const getCoreColors = () => {
    switch (status) {
      case 'listening':
        return {
          glow: 'rgba(245, 158, 11, 0.45)',
          stroke: '#f59e0b',
          accent: 'text-amber-400',
          label: 'LISTENING FOR AUDIO INPUT...',
        };
      case 'processing':
        return {
          glow: 'rgba(56, 189, 248, 0.55)',
          stroke: '#38bdf8',
          accent: 'text-sky-400',
          label: 'COMPUTING DIRECTIVE...',
        };
      case 'speaking':
        return {
          glow: 'rgba(16, 185, 129, 0.5)',
          stroke: '#10b981',
          accent: 'text-emerald-400',
          label: 'VOCALIZING RESPONSE...',
        };
      case 'executing':
        return {
          glow: 'rgba(168, 85, 247, 0.5)',
          stroke: '#a855f7',
          accent: 'text-purple-400',
          label: 'EXECUTING SUBSYSTEM COMMAND...',
        };
      default:
        return {
          glow: 'rgba(56, 189, 248, 0.35)',
          stroke: '#38bdf8',
          accent: 'text-sky-400',
          label: 'SYSTEM STANDING BY',
        };
    }
  };

  const currentTheme = getCoreColors();

  // Waveform bars count
  const waveBars = Array.from({ length: 24 });

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Holographic Arc Reactor Display */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center my-4">
        {/* Outer ambient glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none opacity-60"
          style={{ background: currentTheme.glow }}
        />

        {/* Outer Rotating HUD Ring 1 */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none"
          viewBox="0 0 400 400"
        >
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="1.2"
            strokeOpacity="0.25"
            strokeDasharray="4 8"
          />
          <circle
            cx="200"
            cy="200"
            r="165"
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="1.8"
            strokeOpacity="0.4"
            strokeDasharray="20 40 80 40"
          />
          {/* Tick markers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="200"
              y1="22"
              x2="200"
              y2="34"
              stroke={currentTheme.stroke}
              strokeWidth="2"
              strokeOpacity="0.7"
              transform={`rotate(${deg} 200 200)`}
            />
          ))}
        </svg>

        {/* Counter Rotating Ring 2 */}
        <svg
          className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-spin-reverse pointer-events-none"
          viewBox="0 0 350 350"
        >
          <circle
            cx="175"
            cy="175"
            r="140"
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="2"
            strokeOpacity="0.5"
            strokeDasharray="14 14"
          />
          <circle
            cx="175"
            cy="175"
            r="120"
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          {/* Precision marks */}
          {[15, 75, 105, 165, 195, 255, 285, 345].map((deg) => (
            <circle
              key={deg}
              cx="175"
              cy="45"
              r="2"
              fill={currentTheme.stroke}
              opacity="0.8"
              transform={`rotate(${deg} 175 175)`}
            />
          ))}
        </svg>

        {/* Inner Segmented Arc Core */}
        <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-sky-400/30 bg-radial from-sky-950/80 via-[#071126]/90 to-[#040813] flex flex-col items-center justify-center shadow-inner overflow-hidden">
          {/* Holographic grid texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Glowing central core circle */}
          <div
            className={`w-20 h-20 rounded-full border border-sky-400/60 flex items-center justify-center transition-all duration-300 ${
              isListening ? 'animate-ping scale-110' : status === 'speaking' ? 'animate-pulse' : 'animate-arc-glow'
            }`}
            style={{
              boxShadow: `0 0 25px ${currentTheme.stroke}88, inset 0 0 15px ${currentTheme.stroke}66`,
              borderColor: currentTheme.stroke,
            }}
          >
            <div
              className="w-10 h-10 rounded-full transition-colors duration-300 flex items-center justify-center"
              style={{ background: currentTheme.stroke }}
            >
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
            </div>
          </div>

          {/* Subtext info */}
          <div className="mt-3 text-center z-10">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              JARVIS AI
            </span>
          </div>
        </div>
      </div>

      {/* Audio Waveform Visualizer */}
      <div className="w-full max-w-md h-8 flex items-center justify-center gap-1 my-2 px-4">
        {waveBars.map((_, i) => {
          const isActive = isListening || status === 'speaking' || status === 'processing';
          // Calculate varied heights
          const randomOffset = Math.sin((i / waveBars.length) * Math.PI) * 100;
          return (
            <div
              key={i}
              className="w-1.5 rounded-full transition-all duration-150"
              style={{
                height: isActive
                  ? `${Math.max(15, (randomOffset * (isListening ? 0.9 : 0.6)) % 100)}%`
                  : '12%',
                backgroundColor: currentTheme.stroke,
                opacity: isActive ? 0.85 : 0.25,
              }}
            />
          );
        })}
      </div>

      {/* Status Label */}
      <div className="flex items-center gap-2 mt-1 mb-4 font-mono text-xs tracking-wider">
        <span className="text-slate-500">ENGINE:</span>
        <span className={`font-semibold ${currentTheme.accent}`}>{currentTheme.label}</span>
      </div>

      {/* Real-time Voice Transcript Live Bubble */}
      {interimTranscript && (
        <div className="mb-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-mono max-w-lg text-center animate-fade-in">
          <span className="text-amber-400 font-semibold">Live Speech:</span> &ldquo;{interimTranscript}&rdquo;
        </div>
      )}

      {/* Primary Voice Action Trigger */}
      <div className="flex flex-col items-center gap-2 my-2">
        <button
          onClick={onToggleVoice}
          className={`relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${
            isListening
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/40 ring-4 ring-amber-500/30 scale-105'
              : 'bg-sky-500/20 text-sky-400 border border-sky-400/50 hover:bg-sky-500/30 hover:border-sky-300 shadow-sky-500/20'
          }`}
          title={isListening ? 'Click to stop listening' : 'Click to speak to JARVIS'}
        >
          {isListening ? (
            <Mic className="w-7 h-7 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
        </button>
        <span className="text-xs font-mono text-slate-400">
          {isListening ? 'Tap to complete speech' : 'Tap mic to talk (Hindi / English)'}
        </span>
      </div>

      {/* Text Command Input Bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mt-4">
        <div className="relative flex items-center bg-slate-900/80 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-sky-500/80 transition-colors shadow-lg">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Command JARVIS (e.g. 'phone lock karo', 'apk banao', 'battery batao')..."
            className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center justify-center p-2.5 bg-sky-500 text-slate-950 rounded-xl hover:bg-sky-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Dispatch command"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Action Directives */}
      <div className="w-full max-w-2xl mt-6">
        <div className="text-xs font-mono text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>QUICK DIRECTIVES:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickCommand('Mera phone lock kar do')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3 text-sky-400" />
            Lock Phone
          </button>
          <button
            onClick={() => handleQuickCommand('Battery status check karo')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Battery Diagnostic
          </button>
          <button
            onClick={() => handleQuickCommand('Flashlight on karo')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3 text-yellow-300" />
            Toggle Flashlight
          </button>
          <button
            onClick={() => handleQuickCommand('Ek Python automation script banao')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3 h-3 text-emerald-400" />
            Generate Python Script
          </button>
          <button
            onClick={() => handleQuickCommand('Ek Android APK compile karo')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-3 h-3 text-purple-400" />
            Build Android APK
          </button>
          <button
            onClick={() => handleQuickCommand('Location coordinates scan karo')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3 h-3 text-sky-400" />
            Scan Location
          </button>
          <button
            onClick={() => handleQuickCommand('Show system telemetry and analytics')}
            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-sky-300 border-sky-500/30 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            Task Completion & Stats
          </button>
        </div>
      </div>
    </div>
  );
};
