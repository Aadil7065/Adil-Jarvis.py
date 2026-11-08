import { DaemonLogEntry } from '../types';

type LogSubscriber = (logs: DaemonLogEntry[]) => void;

class DaemonLogger {
  private logs: DaemonLogEntry[] = [];
  private subscribers: Set<LogSubscriber> = new Set();
  private maxLogs: number = 200;
  private isPaused: boolean = false;

  constructor() {
    // Initial seed logs
    this.logs = [
      {
        id: 'seed-1',
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
        subsystem: 'Security',
        level: 'NOMINAL',
        message: 'Foreground Service Attached (Priority: HIGH)',
        details: 'PID: 1042 · Channel: jarvis_automation',
      },
      {
        id: 'seed-2',
        timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
        subsystem: 'Voice',
        level: 'PULSE',
        message: 'Acoustic Hotword Buffer Armed ("Hey Jarvis")',
        details: 'Acoustic engine listening in Hindi / English',
      },
      {
        id: 'seed-3',
        timestamp: new Date(Date.now() - 30000).toLocaleTimeString(),
        subsystem: 'Network',
        level: 'NOMINAL',
        message: 'Wi-Fi 6 Telemetry Probe Verified (18ms latency)',
        details: 'Encrypted tunnel active · Zero packet loss',
      },
      {
        id: 'seed-4',
        timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
        subsystem: 'Power',
        level: 'PULSE',
        message: 'Battery drain telemetry analyzed (0.12%/hr rate)',
        details: 'Thermal threshold: 28.5°C · Optimal health',
      },
    ];
  }

  getLogs(): DaemonLogEntry[] {
    return [...this.logs];
  }

  log(
    subsystem: DaemonLogEntry['subsystem'],
    level: DaemonLogEntry['level'],
    message: string,
    details?: string
  ) {
    if (this.isPaused) return;

    const entry: DaemonLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      subsystem,
      level,
      message,
      details,
    };

    this.logs = [entry, ...this.logs.slice(0, this.maxLogs - 1)];
    this.notify();
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  subscribe(listener: LogSubscriber): () => void {
    this.subscribers.add(listener);
    listener([...this.logs]);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify() {
    const current = [...this.logs];
    this.subscribers.forEach((fn) => fn(current));
  }
}

export const daemonLogger = new DaemonLogger();
