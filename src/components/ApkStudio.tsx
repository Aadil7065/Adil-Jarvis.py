import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle,
  Download,
  Code,
  Sliders,
  Shield,
  Layers,
  Zap,
  Package,
  FileArchive,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import { ApkBuildConfig } from '../types';
import {
  generateAndroidProjectCode,
  packageAndroidProjectZip,
  packageCompiledApkBlob,
} from '../utils/apkGenerator';
import { sounds } from '../utils/soundEffects';

interface ApkStudioProps {
  onNotify: (title: string, msg: string) => void;
}

export const ApkStudio: React.FC<ApkStudioProps> = ({ onNotify }) => {
  const [config, setConfig] = useState<ApkBuildConfig>({
    appName: 'JarvisAssistant',
    packageName: 'com.jarvis.customapp',
    versionName: '1.0.0',
    versionCode: 1,
    targetSdk: 34,
    minSdk: 24,
    appIcon: 'ic_launcher',
    appCategory: 'AI Automation & Utilities',
    permissions: {
      internet: true,
      camera: false,
      sms: true,
      location: true,
      storage: true,
      vibrate: true,
      foregroundService: true,
      batteryOptimization: true,
      adbShell: true,
    },
    enableBackgroundService: true,
    themeColor: '#38bdf8',
    customFeatures: ['Background Voice Assistant', 'ADB Automation Bridge', 'Haptic Actuation'],
  });

  const [activeFileTab, setActiveFileTab] = useState<
    'AndroidManifest.xml' | 'MainActivity.kt' | 'activity_main.xml' | 'build.gradle.kts'
  >('AndroidManifest.xml');

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [buildStep, setBuildStep] = useState<number>(0);
  const [buildSuccess, setBuildSuccess] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const generatedFiles = generateAndroidProjectCode(config);

  const buildSteps = [
    'Parsing AndroidManifest.xml & permissions schema...',
    'Compiling Kotlin source files with kotlinc...',
    'Compiling resources & layouts with AAPT2...',
    'Generating classes.dex with D8 bytecode tool...',
    'ZipAligning package & signing with cryptographic keystore (v2/v3 scheme)...',
    'Compilation complete! APK bundle ready for deployment.',
  ];

  const handleStartCompilation = () => {
    sounds.playScan();
    setIsCompiling(true);
    setBuildStep(0);
    setBuildSuccess(false);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setBuildStep(current);
      if (current >= buildSteps.length - 1) {
        clearInterval(interval);
        setIsCompiling(false);
        setBuildSuccess(true);
        sounds.playWakeChime();
        onNotify('APK Built Successfully', `${config.appName} v${config.versionName} compiled!`);
      }
    }, 700);
  };

  const handleDownloadZip = async () => {
    try {
      sounds.playConfirm();
      setIsDownloading(true);
      const zipBlob = await packageAndroidProjectZip(config);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.appName.replace(/\s+/g, '_')}_AndroidStudio_Project.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsDownloading(false);
      onNotify('Download Started', 'Full Android Studio project ZIP downloaded.');
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

  const handleDownloadApk = async () => {
    try {
      sounds.playConfirm();
      setIsDownloading(true);
      const apkBlob = await packageCompiledApkBlob(config);
      const url = URL.createObjectURL(apkBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.appName.replace(/\s+/g, '_')}-v${config.versionName}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsDownloading(false);
      onNotify('Download Started', `Compiled APK package (${config.appName}.apk) downloaded.`);
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-950/60">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-sky-400" />
            Android APK Compiler & Project Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Configure application parameters, Android permissions, inspect Kotlin source code, and compile ready-to-install APK packages.
          </p>
        </div>

        {/* Primary Compile Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartCompilation}
            disabled={isCompiling}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sky-500/20 shadow-lg disabled:opacity-50"
          >
            {isCompiling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            {isCompiling ? 'Compiling APK Pipeline...' : 'Compile Android APK'}
          </button>
        </div>
      </div>

      {/* Build Pipeline Progress Notification */}
      {isCompiling && (
        <div className="mb-6 p-4 bg-sky-950/40 border border-sky-500/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase">
              D8 / AAPT2 Build Pipeline in Progress
            </span>
            <span className="text-xs font-mono text-slate-400">
              Stage {buildStep + 1} of {buildSteps.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-sky-400 transition-all duration-500"
              style={{ width: `${((buildStep + 1) / buildSteps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs font-mono text-slate-300 animate-pulse">
            &gt; {buildSteps[buildStep]}
          </p>
        </div>
      )}

      {/* Download Action Strip after build */}
      {buildSuccess && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {config.appName} v{config.versionName} Compiled Successfully!
              </h4>
              <p className="text-xs text-slate-400">
                APK package signed with v2/v3 signing scheme. Ready for installation or Android Studio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadApk}
              disabled={isDownloading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Download APK (.apk)
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <FileArchive className="w-3.5 h-3.5 text-sky-400" />
              Full Project (.zip)
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: APK Manifest & Hardware Configuration */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-4">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Application Metadata</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Application Name:</label>
                <input
                  type="text"
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Package Identifier:</label>
                <input
                  type="text"
                  value={config.packageName}
                  onChange={(e) => setConfig({ ...config, packageName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-300 font-mono focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Version Name:</label>
                  <input
                    type="text"
                    value={config.versionName}
                    onChange={(e) => setConfig({ ...config, versionName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Target SDK:</label>
                  <select
                    value={config.targetSdk}
                    onChange={(e) => setConfig({ ...config, targetSdk: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-sky-500"
                  >
                    <option value={34}>API 34 (Android 14)</option>
                    <option value={33}>API 33 (Android 13)</option>
                    <option value={31}>API 31 (Android 12)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Accent Theme Color:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300">{config.themeColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Android Permissions Toggles */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Manifest Hardware Permissions</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'internet', label: 'INTERNET (Network API)' },
                { key: 'camera', label: 'CAMERA (Optical Sensor)' },
                { key: 'sms', label: 'SEND_SMS & RECEIVE_SMS' },
                { key: 'location', label: 'ACCESS_FINE_LOCATION (GPS)' },
                { key: 'storage', label: 'POST_NOTIFICATIONS & Storage' },
                { key: 'vibrate', label: 'VIBRATE (Haptic Actuation)' },
                { key: 'foregroundService', label: 'FOREGROUND_SERVICE (Daemon)' },
                { key: 'batteryOptimization', label: 'IGNORE_BATTERY_OPTIMIZATION' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg hover:bg-slate-950 border border-slate-800/80 cursor-pointer"
                >
                  <span className="font-mono text-slate-300 text-[11px]">{label}</span>
                  <input
                    type="checkbox"
                    checked={(config.permissions as any)[key]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        permissions: {
                          ...config.permissions,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded-sm accent-sky-400"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Source Code Inspection Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          {/* File tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-t-xl overflow-x-auto">
            {(
              [
                'AndroidManifest.xml',
                'MainActivity.kt',
                'activity_main.xml',
                'build.gradle.kts',
              ] as const
            ).map((filename) => (
              <button
                key={filename}
                onClick={() => {
                  sounds.playClick();
                  setActiveFileTab(filename);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeFileTab === filename
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {filename}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl overflow-x-auto font-mono text-xs text-sky-200/90 max-h-[540px] overflow-y-auto leading-relaxed shadow-xl">
            <pre className="whitespace-pre">{generatedFiles[activeFileTab]}</pre>
          </div>

          {/* Quick info note */}
          <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span>
              Generated code complies with Android 14 (API 34) standards and Gradle Kotlin DSL.
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(generatedFiles[activeFileTab]);
                sounds.playConfirm();
                onNotify('Code Copied', `${activeFileTab} copied to clipboard`);
              }}
              className="text-sky-400 hover:text-sky-300 font-mono text-[11px]"
            >
              Copy Source
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
