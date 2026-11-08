import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Cpu,
  Smartphone,
  Code2,
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  LineChart as LineChartIcon,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { InteractionHeatmap } from './InteractionHeatmap';

// Time-series mock data for different windows
const HOURLY_DATA = [
  { time: '00:00', completed: 18, daemon: 32, failed: 0, rate: 100 },
  { time: '02:00', completed: 12, daemon: 28, failed: 0, rate: 100 },
  { time: '04:00', completed: 8, daemon: 24, failed: 1, rate: 97.0 },
  { time: '06:00', completed: 24, daemon: 35, failed: 0, rate: 100 },
  { time: '08:00', completed: 78, daemon: 45, failed: 2, rate: 98.4 },
  { time: '10:00', completed: 112, daemon: 52, failed: 1, rate: 99.4 },
  { time: '12:00', completed: 95, daemon: 48, failed: 0, rate: 100 },
  { time: '14:00', completed: 124, daemon: 58, failed: 2, rate: 98.9 },
  { time: '16:00', completed: 140, daemon: 62, failed: 1, rate: 99.5 },
  { time: '18:00', completed: 108, daemon: 50, failed: 0, rate: 100 },
  { time: '20:00', completed: 88, daemon: 44, failed: 1, rate: 99.2 },
  { time: '22:00', completed: 54, daemon: 38, failed: 0, rate: 100 },
];

const DAILY_7D_DATA = [
  { time: 'Mon', completed: 420, daemon: 280, failed: 4, rate: 99.4 },
  { time: 'Tue', completed: 512, daemon: 310, failed: 6, rate: 99.3 },
  { time: 'Wed', completed: 640, daemon: 330, failed: 5, rate: 99.5 },
  { time: 'Thu', completed: 580, daemon: 295, failed: 3, rate: 99.7 },
  { time: 'Fri', completed: 720, daemon: 360, failed: 8, rate: 99.3 },
  { time: 'Sat', completed: 490, daemon: 240, failed: 2, rate: 99.8 },
  { time: 'Sun', completed: 430, daemon: 220, failed: 1, rate: 99.9 },
];

const MONTHLY_30D_DATA = [
  { time: 'Week 1', completed: 3200, daemon: 1800, failed: 24, rate: 99.5 },
  { time: 'Week 2', completed: 3650, daemon: 1950, failed: 18, rate: 99.7 },
  { time: 'Week 3', completed: 4120, daemon: 2200, failed: 31, rate: 99.5 },
  { time: 'Week 4', completed: 3980, daemon: 2050, failed: 19, rate: 99.7 },
];

const WEEKLY_TREND_DATA = [
  { week: 'Wk 1', completed: 2840, interactions: 4120, daemonSyncs: 1650, completionRate: 98.6 },
  { week: 'Wk 2', completed: 3120, interactions: 4580, daemonSyncs: 1780, completionRate: 98.9 },
  { week: 'Wk 3', completed: 3490, interactions: 5040, daemonSyncs: 1910, completionRate: 99.1 },
  { week: 'Wk 4', completed: 3880, interactions: 5620, daemonSyncs: 2040, completionRate: 99.3 },
  { week: 'Wk 5', completed: 4210, interactions: 6150, daemonSyncs: 2180, completionRate: 99.4 },
  { week: 'Wk 6', completed: 4680, interactions: 6890, daemonSyncs: 2320, completionRate: 99.5 },
  { week: 'Wk 7', completed: 5150, interactions: 7420, daemonSyncs: 2460, completionRate: 99.7 },
  { week: 'Wk 8', completed: 5620, interactions: 8100, daemonSyncs: 2600, completionRate: 99.8 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Phone & Device Control', value: 485, color: '#38bdf8' },
  { name: 'Coding Studio Tasks', value: 342, color: '#10b981' },
  { name: 'APK Build Pipeline', value: 168, color: '#a855f7' },
  { name: 'Voice & NLP Intent', value: 520, color: '#f59e0b' },
  { name: 'Background Daemon Directives', value: 390, color: '#6366f1' },
];

const LATENCY_DISTRIBUTION = [
  { range: '< 50ms', count: 640 },
  { range: '50-100ms', count: 480 },
  { range: '100-200ms', count: 320 },
  { range: '200-500ms', count: 110 },
  { range: '> 500ms', count: 25 },
];

interface AnalyticsDashboardProps {
  onNotify: (title: string, msg: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onNotify }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [metricFilter, setMetricFilter] = useState<'all' | 'completed' | 'daemon'>('all');
  const [weeklyRange, setWeeklyRange] = useState<'4w' | '8w'>('8w');
  const [visibleLines, setVisibleLines] = useState({
    completed: true,
    interactions: true,
    daemonSyncs: true,
    rate: true,
  });

  const activeWeeklyData = useMemo(() => {
    return weeklyRange === '4w' ? WEEKLY_TREND_DATA.slice(-4) : WEEKLY_TREND_DATA;
  }, [weeklyRange]);

  const chartData = useMemo(() => {
    switch (timeRange) {
      case '24h':
        return HOURLY_DATA;
      case '30d':
        return MONTHLY_30D_DATA;
      case '7d':
      default:
        return DAILY_7D_DATA;
    }
  }, [timeRange]);

  // Aggregate totals
  const stats = useMemo(() => {
    const totalCompleted = chartData.reduce((acc, curr) => acc + curr.completed, 0);
    const totalDaemon = chartData.reduce((acc, curr) => acc + curr.daemon, 0);
    const totalFailed = chartData.reduce((acc, curr) => acc + curr.failed, 0);
    const totalAll = totalCompleted + totalDaemon + totalFailed;
    const avgRate = ((totalCompleted + totalDaemon) / totalAll) * 100;

    return {
      totalTasks: totalAll,
      completed: totalCompleted,
      daemon: totalDaemon,
      failed: totalFailed,
      successRate: avgRate.toFixed(1),
    };
  }, [chartData]);

  const handleExportData = () => {
    sounds.playConfirm();
    const jsonStr = JSON.stringify({ timeRange, stats, chartData, categoryBreakdown: CATEGORY_DISTRIBUTION }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_analytics_${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Analytics Exported', `Saved ${timeRange} summary report to disk`);
  };

  const handleRefresh = () => {
    sounds.playScan();
    onNotify('Telemetry Synchronized', 'Real-time usage metrics updated from local buffer.');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-950/60">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-sky-400" />
            Task Completion & Subsystem Telemetry
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Recharts-powered usage metrics, success rate trajectories, and hardware execution distribution.
          </p>
        </div>

        {/* Controls: Time range & Export */}
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                sounds.playClick();
                setTimeRange('24h');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                timeRange === '24h'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTimeRange('7d');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                timeRange === '7d'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTimeRange('30d');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                timeRange === '30d'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-sky-400 transition-colors"
            title="Sync Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportData}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sky-500/20 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Success Rate */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {stats.successRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.failed} failed out of {stats.totalTasks.toLocaleString()} directives
          </p>
        </div>

        {/* Card 2: Interactive Tasks */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">User Directives</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {stats.completed.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Voice, text & quick button commands
          </p>
        </div>

        {/* Card 3: Autonomous Background Runs */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Daemon Cycles</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300 tabular-nums">
            {stats.daemon.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Scheduled checks, syncs & probes
          </p>
        </div>

        {/* Card 4: Mean Response Latency */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Average Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            118<span className="text-sm font-normal text-slate-400">ms</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sub-second hardware bridge execution
          </p>
        </div>
      </div>

      {/* Weekly Multi-Week Trend Line Chart */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <LineChartIcon className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                Weekly Trend: Task Completions & System Interaction Volume
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-week trajectory analyzing completed tasks against total incoming system interactions using Recharts LineChart.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Range Selector: 4 Weeks vs 8 Weeks */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
              <button
                onClick={() => {
                  sounds.playClick();
                  setWeeklyRange('4w');
                }}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  weeklyRange === '4w'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Last 4 Weeks
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setWeeklyRange('8w');
                }}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  weeklyRange === '8w'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full 8 Weeks
              </button>
            </div>
          </div>
        </div>

        {/* Legend / Interactive Series Toggles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono">
          <span className="text-slate-500 text-[11px] uppercase tracking-wider">Series:</span>
          
          <button
            onClick={() => {
              sounds.playClick();
              setVisibleLines((p) => ({ ...p, completed: !p.completed }));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              visibleLines.completed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-600 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Task Completions</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setVisibleLines((p) => ({ ...p, interactions: !p.interactions }));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              visibleLines.interactions
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-600 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Interaction Volume</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setVisibleLines((p) => ({ ...p, daemonSyncs: !p.daemonSyncs }));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              visibleLines.daemonSyncs
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-600 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Daemon Syncs</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setVisibleLines((p) => ({ ...p, rate: !p.rate }));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              visibleLines.rate
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-600 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Completion Rate (%) [Right Y-Axis]</span>
          </button>
        </div>

        {/* Recharts LineChart */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeWeeklyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="week"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              {/* Primary Left Y-Axis for Volume Count */}
              <YAxis
                yAxisId="volume"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              {/* Secondary Right Y-Axis for Percentage Rate */}
              <YAxis
                yAxisId="rate"
                orientation="right"
                domain={[97, 100]}
                stroke="#f59e0b"
                tick={{ fill: '#f59e0b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl font-mono text-xs space-y-1.5">
                        <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                          <span>Timeline: {label}</span>
                          <span className="text-emerald-400 font-bold">{data.completionRate}% rate</span>
                        </div>
                        <div className="text-emerald-300">
                          Completed Tasks: <span className="text-white font-bold">{data.completed.toLocaleString()}</span>
                        </div>
                        <div className="text-sky-300">
                          Interaction Volume: <span className="text-white font-bold">{data.interactions.toLocaleString()}</span>
                        </div>
                        <div className="text-purple-300">
                          Daemon Sync Cycles: <span className="text-white font-bold">{data.daemonSyncs.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {visibleLines.interactions && (
                <Line
                  yAxisId="volume"
                  type="monotone"
                  name="Interaction Volume"
                  dataKey="interactions"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#38bdf8', stroke: '#050811', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#38bdf8' }}
                />
              )}
              {visibleLines.completed && (
                <Line
                  yAxisId="volume"
                  type="monotone"
                  name="Completed Tasks"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', stroke: '#050811', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              )}
              {visibleLines.daemonSyncs && (
                <Line
                  yAxisId="volume"
                  type="monotone"
                  name="Daemon Syncs"
                  dataKey="daemonSyncs"
                  stroke="#a855f7"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#a855f7' }}
                  activeDot={{ r: 5, fill: '#a855f7' }}
                />
              )}
              {visibleLines.rate && (
                <Line
                  yAxisId="rate"
                  type="monotone"
                  name="Completion Rate (%)"
                  dataKey="completionRate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#f59e0b' }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend Insights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block text-[11px]">8-Week Task Throughput:</span>
            <span className="text-emerald-400 font-bold text-sm">+97.8% growth</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block text-[11px]">System Interaction Volume:</span>
            <span className="text-sky-400 font-bold text-sm">8,100 peak/wk (+96.6%)</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block text-[11px]">Peak Weekly Reliability:</span>
            <span className="text-amber-400 font-bold text-sm">99.8% completion rate</span>
          </div>
        </div>
      </div>

      {/* D3.js 24-Hour Peak Interaction Heatmap */}
      <InteractionHeatmap />

      {/* Primary Chart: Task Completion Rates & Volume Over Time */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Task Execution Volume & Completion Rates</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical timeline of completed tasks vs autonomous daemon background directives.
            </p>
          </div>

          {/* Metric filter buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setMetricFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                metricFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Directives
            </button>
            <button
              onClick={() => setMetricFilter('completed')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                metricFilter === 'completed'
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              User Only
            </button>
            <button
              onClick={() => setMetricFilter('daemon')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                metricFilter === 'daemon'
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daemon Only
            </button>
          </div>
        </div>

        {/* Recharts AreaChart */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorDaemon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl font-mono text-xs space-y-1">
                        <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                          Period: {label}
                        </div>
                        <div className="text-sky-400">
                          User Tasks: <span className="text-white font-bold">{data.completed}</span>
                        </div>
                        <div className="text-purple-400">
                          Daemon Cycles: <span className="text-white font-bold">{data.daemon}</span>
                        </div>
                        <div className="text-emerald-400">
                          Success Rate: <span className="text-white font-bold">{data.rate}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontFamily: 'JetBrains Mono' }}
              />
              {(metricFilter === 'all' || metricFilter === 'completed') && (
                <Area
                  type="monotone"
                  name="User Commands"
                  dataKey="completed"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              )}
              {(metricFilter === 'all' || metricFilter === 'daemon') && (
                <Area
                  type="monotone"
                  name="Daemon Routines"
                  dataKey="daemon"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDaemon)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Grid: Subsystem Distribution & Latency Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Usage by Subsystem Category (BarChart) */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Directives Executed by Subsystem</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative distribution across device control, code generation, APK compilation, and voice.
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CATEGORY_DISTRIBUTION}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  width={110}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl shadow-xl font-mono text-xs">
                          <span className="text-slate-300 font-semibold">{data.name}: </span>
                          <span className="text-sky-400 font-bold">{data.value} tasks</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            {CATEGORY_DISTRIBUTION.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ background: c.color }} />
                <span className="truncate">{c.name.split(' ')[0]}</span>
                <span className="text-slate-200 font-bold ml-auto tabular-nums">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Execution Latency Frequency (BarChart) */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Response Latency Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proportion of directives fulfilled within ultra-low latency brackets.
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={LATENCY_DISTRIBUTION}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} vertical={false} />
                <XAxis
                  dataKey="range"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl shadow-xl font-mono text-xs">
                          <div className="text-slate-400">Latency: {label}</div>
                          <div className="text-emerald-400 font-bold">
                            {payload[0].value} executions
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
            <span>
              91.8% of commands resolve in <strong className="text-emerald-400">&lt; 100ms</strong>
            </span>
            <span className="text-slate-500 text-[11px]">Hardware Acceleration: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
