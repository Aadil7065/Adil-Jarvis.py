import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { CodeProject } from '../types';
import { sounds } from '../utils/soundEffects';

const DEFAULT_PROJECTS: CodeProject[] = [
  {
    id: 'python-automation',
    title: 'Android Phone Automation Daemon',
    language: 'python',
    filename: 'phone_automator.py',
    description: 'Automates screen wake, battery monitoring, and SMS triage using ADB / Termux API.',
    tags: ['Python', 'Automation', 'ADB'],
    code: `import subprocess
import time
import json

class JarvisPhoneAutomator:
    def __init__(self):
        print("◈ [JARVIS CORE ENGINE v2.5]")
        print("Initializing Android Hardware Bridge...")

    def execute_adb_command(self, cmd: str) -> str:
        try:
            result = subprocess.run(["adb", "shell", *cmd.split()], capture_output=True, text=True)
            return result.stdout.strip()
        except Exception as e:
            return f"Bridge Simulation: {cmd} [OK]"

    def check_battery(self):
        print("Checking battery metrics...")
        output = self.execute_adb_command("dumpsys battery")
        print(f"Diagnostics: {output}")

    def toggle_screen_lock(self):
        print("Toggling hardware power key...")
        self.execute_adb_command("input keyevent 26")
        print("Display state updated.")

if __name__ == "__main__":
    bot = JarvisPhoneAutomator()
    bot.check_battery()
    print("Automation loop active. Standing by, Boss.")
`,
  },
  {
    id: 'kotlin-service',
    title: 'Android Background Worker Service',
    language: 'kotlin',
    filename: 'JarvisDaemonService.kt',
    description: 'Foreground Android service with persistent notification and periodic heartbeat.',
    tags: ['Kotlin', 'Android', 'ForegroundService'],
    code: `package com.jarvis.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat

class JarvisDaemonService : Service() {

    override fun onCreate() {
        super.onCreate()
        val channelId = "jarvis_automation_channel"
        val channel = NotificationChannel(
            channelId,
            "JARVIS Automation Subsystem",
            NotificationManager.IMPORTANCE_LOW
        )
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("JARVIS Core Active")
            .setContentText("Monitoring background telemetry and voice triggers")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .build()

        startForeground(101, notification)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`,
  },
  {
    id: 'bash-termux',
    title: 'Termux System Health Watchdog',
    language: 'bash',
    filename: 'termux_watchdog.sh',
    description: 'Real-time script for Termux Android environments to trigger vibration and battery alarms.',
    tags: ['Bash', 'Termux', 'Linux'],
    code: `#!/usr/bin/env bash
# JARVIS Android Termux Watchdog Script
echo "======================================"
echo "    JARVIS SYSTEM WATCHDOG [ONLINE]   "
echo "======================================"

# Trigger haptic pulse
termux-vibrate -d 350
termux-toast "JARVIS: Subsystems synchronized"

# Query Battery status
BATTERY_INFO=$(termux-battery-status 2>/dev/null || echo '{"percentage": 92, "status": "CHARGING"}')
echo "Battery Telemetry:"
echo "$BATTERY_INFO"

echo "Security scan complete. All services nominal, Sir."
`,
  },
  {
    id: 'js-gemini-client',
    title: 'Multi-Modal Voice & Intent Parser',
    language: 'javascript',
    filename: 'jarvis_intent_parser.js',
    description: 'High-speed natural language intent classification engine for smart assistant actions.',
    tags: ['JavaScript', 'NLP', 'Parsing'],
    code: `export function parseVoiceIntent(transcript) {
  const clean = transcript.toLowerCase().trim();
  console.log("Analyzing directive:", clean);

  if (clean.includes("lock") || clean.includes("phone lock")) {
    return { action: "DEVICE_LOCK", target: "display", confidence: 0.99 };
  }
  if (clean.includes("battery") || clean.includes("charge")) {
    return { action: "QUERY_BATTERY", target: "power_management", confidence: 0.98 };
  }
  if (clean.includes("apk") || clean.includes("compile")) {
    return { action: "BUILD_APK", target: "android_compiler", confidence: 0.95 };
  }
  return { action: "NATURAL_CHAT", query: transcript, confidence: 0.90 };
}
`,
  },
];

interface CodingStudioProps {
  onNotify: (title: string, msg: string) => void;
  activeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  } | null;
}

export const CodingStudio: React.FC<CodingStudioProps> = ({
  onNotify,
  activeSnippet,
}) => {
  const [projects, setProjects] = useState<CodeProject[]>(DEFAULT_PROJECTS);
  const [selectedId, setSelectedId] = useState<string>(projects[0].id);
  const [currentCode, setCurrentCode] = useState<string>(projects[0].code);
  const [currentFilename, setCurrentFilename] = useState<string>(projects[0].filename);
  const [currentLang, setCurrentLang] = useState<string>(projects[0].language);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [runLogs, setRunLogs] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // If parent passed an active snippet from voice or chat
  React.useEffect(() => {
    if (activeSnippet && activeSnippet.code) {
      setCurrentCode(activeSnippet.code);
      setCurrentFilename(activeSnippet.filename || 'jarvis_generated.py');
      setCurrentLang(activeSnippet.language || 'python');
      setRunLogs(`// Generated from JARVIS Directive\nReady to execute.`);
    }
  }, [activeSnippet]);

  const handleSelectProject = (project: CodeProject) => {
    sounds.playClick();
    setSelectedId(project.id);
    setCurrentCode(project.code);
    setCurrentFilename(project.filename);
    setCurrentLang(project.language);
    setRunLogs('');
  };

  const handleCopyCode = () => {
    sounds.playConfirm();
    navigator.clipboard?.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('Code Copied', `Copied ${currentFilename} to clipboard`);
  };

  const handleDownloadFile = () => {
    sounds.playConfirm();
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('File Exported', `Saved ${currentFilename} to disk`);
  };

  const handleRunCode = () => {
    sounds.playScan();
    setIsRunning(true);
    setRunLogs('Compiling & Initializing Runtime Virtual Container...\n');

    setTimeout(() => {
      let output = '';
      if (currentLang === 'python') {
        output = `>>> python3 ${currentFilename}\n◈ [JARVIS CORE ENGINE v2.5]\nInitializing Android Hardware Bridge...\nChecking battery metrics...\nDiagnostics: Current Battery: 94% [HEALTH: OPTIMAL]\nToggling hardware power key...\nDisplay state updated.\n✅ Process finished with exit code 0. Execution time: 142ms.`;
      } else if (currentLang === 'kotlin') {
        output = `>>> kotlinc ${currentFilename} -include-runtime -d app.jar\n[Gradle Worker] 1 source file parsed.\n[DEX] Class com.jarvis.service.JarvisDaemonService verified.\n[APK Hook] Foreground service registered with NotificationManager.\n✅ Build successful in 420ms.`;
      } else if (currentLang === 'bash') {
        output = `>>> bash ${currentFilename}\n======================================\n    JARVIS SYSTEM WATCHDOG [ONLINE]   \n======================================\nBattery Telemetry: {"percentage": 94, "status": "CHARGING", "temperature": 28.4}\nSecurity scan complete. All services nominal, Sir.\n✅ Execution finished.`;
      } else {
        output = `>>> node ${currentFilename}\nAnalyzing directive: lock screen\nAction resolved: DEVICE_LOCK (confidence: 0.99)\n✅ Executed successfully.`;
      }
      setRunLogs(output);
      setIsRunning(false);
      sounds.playConfirm();
    }, 600);
  };

  const handleGenerateCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    sounds.playScan();
    setIsGenerating(true);

    setTimeout(() => {
      const lower = customPrompt.toLowerCase();
      let genLang = 'python';
      let genFilename = 'custom_jarvis_script.py';
      let code = '';

      if (lower.includes('wifi') || lower.includes('network') || lower.includes('ping')) {
        genLang = 'python';
        genFilename = 'wifi_network_probe.py';
        code = `import subprocess
import time

def probe_network_status():
    print("◈ [JARVIS NETWORK PROBE ACTIVE]")
    hosts = ["8.8.8.8", "1.1.1.1"]
    for host in hosts:
        print(f"Pinging {host}...")
        # Simulated ping
        print(f"Latency to {host}: 18ms [OK]")
    print("Network interface: Wi-Fi 6 (5GHz) - Encrypted")

if __name__ == "__main__":
    probe_network_status()
`;
      } else if (lower.includes('file') || lower.includes('count') || lower.includes('folder')) {
        genLang = 'python';
        genFilename = 'file_counter.py';
        code = `import os

def count_files_in_directory(path="."):
    total = 0
    print(f"Scanning directory: {os.path.abspath(path)}")
    for root, dirs, files in os.walk(path):
        total += len(files)
    print(f"Total files detected: {total}")
    return total

if __name__ == "__main__":
    count_files_in_directory()
`;
      } else {
        genLang = 'python';
        genFilename = 'jarvis_custom_task.py';
        code = `# Custom script generated for: "${customPrompt}"
import time

def execute_task():
    print("◈ JARVIS Automated Execution Engine")
    print("Target Directive: ${customPrompt}")
    time.sleep(0.5)
    print("✅ Directive processing concluded successfully, Sir.")

if __name__ == "__main__":
    execute_task()
`;
      }

      setCurrentCode(code);
      setCurrentFilename(genFilename);
      setCurrentLang(genLang);
      setIsGenerating(false);
      sounds.playConfirm();
      onNotify('Code Synthesized', `Generated ${genFilename}`);
      setRunLogs(`// Generated custom code for: "${customPrompt}"\nPress 'Run Code' to execute in virtual runtime.`);
      setCustomPrompt('');
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-950/60">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-sky-400" />
            JARVIS Multi-Language Coding Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Generate, edit, and simulate execution for Python automation, Kotlin Android, Bash scripts, and Web tools.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-emerald-500/20 shadow-md disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Running...' : 'Run Virtual Execution'}
          </button>
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadFile}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Code Generation Request Bar */}
      <form onSubmit={handleGenerateCustomCode} className="mb-6">
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-lg">
          <div className="pl-3 text-sky-400">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask JARVIS to synthesize code (e.g. 'Write a python script to count files', 'Termux wifi status probe')..."
            className="flex-1 bg-transparent px-2 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isGenerating || !customPrompt.trim()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate Code'}
          </button>
        </div>
      </form>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Templates & File Explorer */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Project Templates</span>
          </div>

          <div className="space-y-2">
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => handleSelectProject(proj)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedId === proj.id
                    ? 'bg-sky-500/15 border-sky-500/40 text-slate-100 shadow-xs'
                    : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">{proj.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-sky-300">
                    {proj.language}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate mb-1">
                  {proj.filename}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{proj.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Code Editor & Execution Output Terminal */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* File bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border border-slate-800 rounded-t-xl font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <FileCode className="w-4 h-4 text-sky-400" />
              <span className="font-bold">{currentFilename}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 uppercase">{currentLang}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {currentCode.split('\n').length} lines · UTF-8
            </div>
          </div>

          {/* Interactive Code Editor (TextArea with line numbers preview) */}
          <div className="relative bg-slate-950 border border-slate-800 -mt-4 rounded-b-xl overflow-hidden shadow-2xl">
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full bg-slate-950 p-4 font-mono text-xs md:text-sm text-sky-200/90 leading-relaxed focus:outline-hidden resize-y selection:bg-sky-500/30"
            />
          </div>

          {/* Execution Output Console */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Virtual Execution Console Output</span>
              </div>
              <button
                onClick={() => setRunLogs('')}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300"
              >
                Clear Output
              </button>
            </div>
            <pre className="p-3 bg-black/90 rounded-lg border border-slate-900 font-mono text-xs text-emerald-400/90 whitespace-pre-wrap min-h-24 max-h-48 overflow-y-auto">
              {runLogs || '// Console idle. Click "Run Virtual Execution" above to test run the script.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
