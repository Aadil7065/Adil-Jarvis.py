import React, { useState } from 'react';
import {
  X,
  Key,
  Mic,
  Volume2,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { JarvisSettings } from '../types';
import { sounds, speakText } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: JarvisSettings;
  setSettings: React.Dispatch<React.SetStateAction<JarvisSettings>>;
  onNotify: (title: string, msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  onNotify,
}) => {
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestApiKey = async () => {
    if (!settings.apiKey.trim()) {
      setKeyStatus('No API key provided.');
      return;
    }

    sounds.playScan();
    setIsTestingKey(true);
    setKeyStatus('Testing connection to Gemini API...');

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
          }),
        }
      );

      if (res.ok) {
        setKeyStatus('✅ Manual API Key verified successfully!');
        sounds.playWakeChime();
        onNotify('API Key Validated', 'Connected to Gemini API directly.');
      } else {
        const errorData = await res.json();
        setKeyStatus(`❌ Error: ${errorData.error?.message || 'Invalid API key'}`);
      }
    } catch (err: any) {
      setKeyStatus(`❌ Connection error: ${err.message}`);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleTestVoice = () => {
    sounds.playClick();
    const testText =
      settings.speechLanguage === 'hi-IN'
        ? 'आवाज प्रणाली का परीक्षण सफल रहा, जनाब। जार्विस आपके निर्देशों के लिए तैयार है।'
        : 'Acoustic vocalization test successful, Sir. Standing by for instructions.';

    speakText(testText, {
      lang: settings.speechLanguage,
      rate: settings.speechVoiceRate,
      pitch: settings.speechVoicePitch,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#090e1c] border border-sky-500/30 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-sky-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">JARVIS System Configuration</h3>
              <p className="text-xs text-slate-400">
                Manual API keys, voice synthesis, and butler persona customization
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          {/* Section 1: Manual API Key Config */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Manual Gemini API Key (Optional)</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              You can insert your personal Gemini API key here to bypass server quotas or use your private workspace tier. If left empty, the system uses built-in autonomous processing.
            </p>

            <div className="relative flex items-center mb-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => {
                  setSettings({ ...settings, apiKey: e.target.value });
                  setKeyStatus(null);
                }}
                placeholder="AIzaSy..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-400 pr-24"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-200"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={isTestingKey || !settings.apiKey.trim()}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                >
                  {isTestingKey ? 'Testing...' : 'Verify'}
                </button>
              </div>
            </div>

            {keyStatus && (
              <div className="text-xs font-mono mt-1 text-slate-300">{keyStatus}</div>
            )}
          </div>

          {/* Section 2: AI Model Selection */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>AI Intelligence Engine Model</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Fast, high efficiency' },
                { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Lite', desc: 'Minimal latency' },
                { id: 'gemini-4-argon', name: 'Gemini 4 Argon', desc: 'Advanced reasoning' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    sounds.playClick();
                    setSettings({ ...settings, model: m.id });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.model === m.id
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs">{m.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Speech & Audio Settings */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Voice & Speech Synthesis (TTS)</span>
              </div>
              <button
                onClick={handleTestVoice}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Test Voice
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Language Recognition:</label>
                <select
                  value={settings.speechLanguage}
                  onChange={(e) =>
                    setSettings({ ...settings, speechLanguage: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
                >
                  <option value="hi-IN">Hindi (हिंदी - Bharat)</option>
                  <option value="en-IN">English (India / Hinglish)</option>
                  <option value="en-US">English (US Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Voice Rate ({settings.speechVoiceRate}x):
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={settings.speechVoiceRate}
                  onChange={(e) =>
                    setSettings({ ...settings, speechVoiceRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
                />
              </div>

              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between p-2 bg-slate-900 rounded-lg cursor-pointer">
                  <span className="text-xs text-slate-300">Auto Vocalize Responses (Read Aloud)</span>
                  <input
                    type="checkbox"
                    checked={settings.autoSpeak}
                    onChange={(e) => setSettings({ ...settings, autoSpeak: e.target.checked })}
                    className="accent-emerald-400"
                  />
                </label>
                <label className="flex items-center justify-between p-2 bg-slate-900 rounded-lg cursor-pointer">
                  <span className="text-xs text-slate-300">Sci-Fi HUD Sound Effects (Beeps & Chimes)</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => setSettings({ ...settings, soundEffects: e.target.checked })}
                    className="accent-sky-400"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Persona Style */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>JARVIS Persona Demeanor</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'butler', label: 'Loyal Butler (Sir)' },
                { id: 'tony_stark', label: 'Iron Man (Boss)' },
                { id: 'desi_hindi', label: 'Desi Butler (जनाब)' },
                { id: 'tech_expert', label: 'Lead Engineer' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playClick();
                    setSettings({ ...settings, personaStyle: p.id as any });
                  }}
                  className={`p-2.5 rounded-xl border text-center text-xs transition-colors ${
                    settings.personaStyle === p.id
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playConfirm();
              onClose();
              onNotify('Settings Saved', 'Configuration stored in local storage.');
            }}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
