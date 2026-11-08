import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { JarvisCore } from './components/JarvisCore';
import { DeviceBridge } from './components/DeviceBridge';
import { CodingStudio } from './components/CodingStudio';
import { ApkStudio } from './components/ApkStudio';
import { BackgroundDaemon } from './components/BackgroundDaemon';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ChatFeed } from './components/ChatFeed';
import { DaemonLogOverlay } from './components/DaemonLogOverlay';
import {
  DeviceState,
  JarvisMessage,
  JarvisSettings,
  JarvisStatus,
} from './types';
import { sounds, speakText, stopSpeaking } from './utils/soundEffects';
import { speechListener } from './utils/speechRecognition';
import { dispatchJarvisQuery } from './utils/geminiClient';
import { daemonLogger } from './utils/daemonLogger';

const INITIAL_SETTINGS: JarvisSettings = {
  apiKey: '',
  useServerKey: true,
  model: 'gemini-3.8-flash',
  speechLanguage: 'en-US',
  speechVoiceRate: 1.05,
  speechVoicePitch: 0.95,
  autoSpeak: true,
  soundEffects: true,
  continuousListening: false,
  backgroundDaemonEnabled: true,
  personaStyle: 'tony_stark',
};

const INITIAL_DEVICE_STATE: DeviceState = {
  isLocked: false,
  batteryLevel: 92,
  isCharging: true,
  flashlightOn: false,
  volume: 75,
  vibrateMs: 400,
  wifiConnected: true,
  bluetoothConnected: true,
  currentLocation: {
    lat: 28.6139,
    lng: 77.2090,
    accuracy: 12,
    address: 'New Delhi / Central Hub',
  },
  clipboardText: 'JARVIS-PRO-AUTOMATION-BRIDGE-INITIALIZED',
  smsLog: [
    {
      id: '1',
      number: '+91 98765 00001',
      message: 'Sir, daily system automated diagnostics report generated.',
      timestamp: '11:45 AM',
    },
  ],
  callLog: [],
};

const INITIAL_MESSAGES: JarvisMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'jarvis',
    timestamp: 'Just now',
    text: `📊 **[JARVIS CORE v3.8 - SYSTEM DASHBOARD]**\n🔹 **Status:** All sub-routines active & nominal\n🔹 **System:** Created by Adil · Android Automation Engine\n🔹 **Directives:** Standing by, Boss! You can control phone locks, battery, audio, synthesize code, or package Android APKs directly. How may I assist you, Sir?`,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'hud' | 'device' | 'code' | 'apk' | 'daemon' | 'analytics'>('hud');
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [deviceState, setDeviceState] = useState<DeviceState>(INITIAL_DEVICE_STATE);
  const [messages, setMessages] = useState<JarvisMessage[]>(INITIAL_MESSAGES);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeSnippet, setActiveSnippet] = useState<JarvisMessage['codeSnippet'] | null>(null);

  // Settings with LocalStorage persistence
  const [settings, setSettings] = useState<JarvisSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_SETTINGS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jarvis_settings', JSON.stringify(settings));
      } catch (e) {
        // ignore
      }
    }
  }, [settings]);

  // Toast Notification helper
  const showToast = (title: string, msg: string) => {
    setToastNotification(`${title}: ${msg}`);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Dispatch and execute a natural language or voice command
  const handleExecuteCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    // Add user message
    const userMsg: JarvisMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: commandText,
    };
    setMessages((prev) => [...prev, userMsg]);

    setStatus('processing');
    if (settings.soundEffects) sounds.playScan();

    try {
      daemonLogger.log('Voice', 'EXEC', `Directive received: "${commandText.slice(0, 35)}..."`);
      const result = await dispatchJarvisQuery(commandText, deviceState, settings);

      // Execute physical device state side-effects
      if (result.action === 'lock') {
        setDeviceState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
        daemonLogger.log('ADB', 'EXEC', 'Phone display lock state toggled via ADB keyevent 26');
        if (settings.soundEffects) sounds.playConfirm();
      } else if (result.action === 'flashlight') {
        const turnOn = result.parameters?.on ?? !deviceState.flashlightOn;
        setDeviceState((prev) => ({ ...prev, flashlightOn: turnOn }));
        daemonLogger.log('Sensors', 'EXEC', `Hardware flashlight set to: ${turnOn ? 'ACTIVE' : 'OFF'}`);
        if (settings.soundEffects) sounds.playClick();
      } else if (result.action === 'vibrate') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(result.parameters?.ms || 300);
          } catch (e) {}
        }
        daemonLogger.log('Sensors', 'PULSE', 'Haptic vibration waveform dispatched to actuator');
        if (settings.soundEffects) sounds.playConfirm();
      } else if (result.action === 'volume') {
        if (typeof result.parameters?.level === 'number') {
          setDeviceState((prev) => ({ ...prev, volume: result.parameters.level }));
          daemonLogger.log('Sensors', 'NOMINAL', `Volume calibrated to ${result.parameters.level}%`);
        }
      } else if (result.action === 'write_code' && result.codeSnippet) {
        setActiveSnippet(result.codeSnippet);
        daemonLogger.log('Security', 'NOMINAL', `Code synthesized: ${result.codeSnippet.filename}`);
      } else if (result.action === 'build_apk') {
        setActiveTab('apk');
        daemonLogger.log('APK', 'EXEC', 'APK compilation studio loaded for project build');
      } else if (result.action === 'analytics' || commandText.toLowerCase().includes('stat') || commandText.toLowerCase().includes('telemetry') || commandText.toLowerCase().includes('analytics')) {
        setActiveTab('analytics');
        daemonLogger.log('Network', 'NOMINAL', 'Telemetry and usage metrics dashboard loaded');
      }

      // Add Jarvis message
      const jarvisMsg: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: result.response,
        action: result.action,
        parameters: result.parameters,
        codeSnippet: result.codeSnippet,
        apkDetails: result.apkDetails,
      };

      setMessages((prev) => [...prev, jarvisMsg]);

      // Speak response aloud if enabled
      if (settings.autoSpeak) {
        setStatus('speaking');
        speakText(result.response, {
          lang: settings.speechLanguage,
          rate: settings.speechVoiceRate,
          pitch: settings.speechVoicePitch,
          onEnd: () => {
            setStatus('idle');
          },
        });
      } else {
        setStatus('idle');
        if (settings.soundEffects) sounds.playConfirm();
      }
    } catch (err: any) {
      console.error(err);
      setStatus('idle');
      const errorMsg: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `📊 **[SYSTEM NOTICE]**\nSir, an anomaly was encountered while routing the command. Local subsystems remain functional.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Toggle Voice Recognition
  const handleToggleVoice = () => {
    if (isListening) {
      speechListener.stop();
      setIsListening(false);
      setInterimTranscript('');
      setStatus('idle');
      return;
    }

    if (!speechListener.isSupported()) {
      showToast('Microphone Notice', 'Web Speech Recognition not supported in this browser environment.');
      return;
    }

    stopSpeaking();
    if (settings.soundEffects) sounds.playWakeChime();

    speechListener.start({
      lang: settings.speechLanguage,
      continuous: settings.continuousListening,
      onStart: () => {
        setIsListening(true);
        setStatus('listening');
      },
      onResult: (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          setInterimTranscript('');
          handleExecuteCommand(transcript);
        }
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
        if (status === 'listening') setStatus('idle');
      },
      onError: (err) => {
        setIsListening(false);
        setInterimTranscript('');
        setStatus('idle');
        console.warn('Speech error:', err);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-100">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          sounds.playClick();
          setActiveTab(tab);
        }}
        status={status}
        onOpenSettings={() => {
          sounds.playClick();
          setIsSettingsOpen(true);
        }}
        backgroundDaemonActive={settings.backgroundDaemonEnabled}
      />

      {/* Floating System Toast */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#090e1c] border border-sky-500/40 text-sky-200 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-mono animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-12">
        {activeTab === 'hud' && (
          <div>
            <JarvisCore
              status={status}
              isListening={isListening}
              onToggleVoice={handleToggleVoice}
              onSubmitText={handleExecuteCommand}
              interimTranscript={interimTranscript}
            />

            {/* Conversation / Directive Stream */}
            <ChatFeed
              messages={messages}
              speechLanguage={settings.speechLanguage}
              onOpenCodeSnippet={(snippet) => {
                setActiveSnippet(snippet);
                setActiveTab('code');
              }}
              onOpenApkDetails={() => {
                setActiveTab('apk');
              }}
            />
          </div>
        )}

        {activeTab === 'device' && (
          <DeviceBridge
            deviceState={deviceState}
            setDeviceState={setDeviceState}
            onNotify={showToast}
          />
        )}

        {activeTab === 'code' && (
          <CodingStudio
            onNotify={showToast}
            activeSnippet={activeSnippet}
          />
        )}

        {activeTab === 'apk' && (
          <ApkStudio onNotify={showToast} />
        )}

        {activeTab === 'daemon' && (
          <BackgroundDaemon
            isActive={settings.backgroundDaemonEnabled}
            onToggleActive={() => {
              sounds.playClick();
              setSettings((prev) => ({
                ...prev,
                backgroundDaemonEnabled: !prev.backgroundDaemonEnabled,
              }));
              showToast(
                'Daemon State Updated',
                !settings.backgroundDaemonEnabled ? 'Daemon started' : 'Daemon paused'
              );
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard onNotify={showToast} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        onNotify={showToast}
      />

      {/* Persistent Floating Background Daemon Log Overlay */}
      <DaemonLogOverlay onNotify={showToast} />
    </div>
  );
}
