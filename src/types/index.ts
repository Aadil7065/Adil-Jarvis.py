export type JarvisStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing';

export interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis';
  timestamp: string;
  text: string;
  action?: string;
  parameters?: Record<string, any>;
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
  apkDetails?: {
    appName: string;
    packageName: string;
    version: string;
  };
}

export interface DeviceState {
  isLocked: boolean;
  batteryLevel: number;
  isCharging: boolean;
  flashlightOn: boolean;
  volume: number; // 0 to 100
  vibrateMs: number;
  wifiConnected: boolean;
  bluetoothConnected: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    address?: string;
    accuracy?: number;
  } | null;
  clipboardText: string;
  smsLog: Array<{ id: string; number: string; message: string; timestamp: string }>;
  callLog: Array<{ id: string; number: string; duration: string; timestamp: string }>;
}

export interface ApkBuildConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  targetSdk: number;
  minSdk: number;
  appIcon: string;
  appCategory: string;
  permissions: {
    internet: boolean;
    camera: boolean;
    sms: boolean;
    location: boolean;
    storage: boolean;
    vibrate: boolean;
    foregroundService: boolean;
    batteryOptimization: boolean;
    adbShell: boolean;
  };
  enableBackgroundService: boolean;
  themeColor: string;
  customFeatures: string[];
}

export interface CodeProject {
  id: string;
  title: string;
  language: 'python' | 'javascript' | 'bash' | 'kotlin' | 'html';
  filename: string;
  code: string;
  description: string;
  tags: string[];
}

export interface JarvisSettings {
  apiKey: string; // Manual user API key (optional)
  useServerKey: boolean;
  model: string;
  speechLanguage: 'hi-IN' | 'en-US' | 'en-IN';
  speechVoiceRate: number;
  speechVoicePitch: number;
  autoSpeak: boolean;
  soundEffects: boolean;
  continuousListening: boolean;
  backgroundDaemonEnabled: boolean;
  personaStyle: 'butler' | 'tony_stark' | 'tech_expert' | 'desi_hindi';
}

export interface DaemonLogEntry {
  id: string;
  timestamp: string;
  subsystem: 'Sensors' | 'Network' | 'Power' | 'Voice' | 'Security' | 'ADB' | 'APK';
  level: 'NOMINAL' | 'PULSE' | 'WARN' | 'EXEC';
  message: string;
  details?: string;
}
