import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Flame, Clock, Filter, Sparkles, Info } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export interface HeatmapCell {
  day: string; // 'Mon', 'Tue', etc.
  dayIndex: number; // 0 to 6
  hour: number; // 0 to 23
  count: number;
  category: 'voice' | 'device' | 'code' | 'apk' | 'all';
  primaryTask: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Generate realistic simulated heatmap data reflecting user assistant routines
const generateHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = [];

  DAYS.forEach((day, dayIndex) => {
    HOURS.forEach((hour) => {
      // Natural usage curve:
      // - Peak between 09:00 - 12:00 (Morning work) and 14:00 - 18:00 (Afternoon coding/automation)
      // - Moderate in evening 19:00 - 22:00 (Home device control/SMS)
      // - Low between 01:00 - 06:00 (Background daemon only)
      // - Weekends have afternoon spikes
      const isWeekend = dayIndex >= 5;
      let base = 0;

      if (hour >= 1 && hour <= 5) {
        base = Math.floor(Math.random() * 5); // 0-4
      } else if (hour >= 6 && hour <= 8) {
        base = 12 + Math.floor(Math.random() * 18);
      } else if (hour >= 9 && hour <= 12) {
        base = isWeekend ? 35 + Math.floor(Math.random() * 25) : 65 + Math.floor(Math.random() * 35);
      } else if (hour >= 13 && hour <= 17) {
        base = isWeekend ? 45 + Math.floor(Math.random() * 30) : 80 + Math.floor(Math.random() * 40);
      } else if (hour >= 18 && hour <= 21) {
        base = 40 + Math.floor(Math.random() * 30);
      } else {
        base = 15 + Math.floor(Math.random() * 15);
      }

      // Add day-specific variances
      if (day === 'Wed' && (hour === 14 || hour === 15)) {
        base = 115; // Peak spike
      }
      if (day === 'Fri' && (hour === 16 || hour === 17)) {
        base = 108; // Friday deploy spike
      }

      let primaryTask = 'General AI Directives';
      if (hour >= 9 && hour <= 12) primaryTask = 'Voice Queries & Briefings';
      else if (hour >= 13 && hour <= 17) primaryTask = 'Code Studio & APK Compilations';
      else if (hour >= 18 && hour <= 22) primaryTask = 'Device Bridge, Lock & Flashlight';
      else primaryTask = 'Background Daemon Probing';

      data.push({
        day,
        dayIndex,
        hour,
        count: base,
        category: 'all',
        primaryTask,
      });
    });
  });

  return data;
};

export const InteractionHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const rawData = useMemo(() => generateHeatmapData(), []);

  // Filtered dataset
  const heatmapData = useMemo(() => {
    if (activeFilter === 'morning') {
      return rawData.filter((d) => d.hour >= 6 && d.hour < 12);
    }
    if (activeFilter === 'afternoon') {
      return rawData.filter((d) => d.hour >= 12 && d.hour < 18);
    }
    if (activeFilter === 'evening') {
      return rawData.filter((d) => d.hour >= 18 || d.hour < 6);
    }
    return rawData;
  }, [rawData, activeFilter]);

  // Overall statistics
  const maxCount = useMemo(() => d3.max(heatmapData, (d) => d.count) || 100, [heatmapData]);
  const peakCell = useMemo(() => {
    return heatmapData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), heatmapData[0]);
  }, [heatmapData]);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 30, right: 30, bottom: 40, left: 45 };
    const width = containerWidth - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const g = svg
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Available hours based on filter
    const activeHours = Array.from(new Set(heatmapData.map((d) => d.hour))).sort((a, b) => a - b);

    // X Scale: Hours
    const xScale = d3
      .scaleBand<number>()
      .domain(activeHours)
      .range([0, width])
      .padding(0.08);

    // Y Scale: Days
    const yScale = d3
      .scaleBand<string>()
      .domain(DAYS)
      .range([0, height])
      .padding(0.1);

    // Custom Color Scale: Deep Dark -> Cyan -> Emerald -> Amber (Iron Man / Cyber HUD theme)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, maxCount * 0.25, maxCount * 0.6, maxCount * 0.85, maxCount])
      .range(['#0a1628', '#0369a1', '#0ea5e9', '#10b981', '#f59e0b']);

    // X Axis: Hours
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => `${d}h`)
      .tickSize(0);

    g.append('g')
      .attr('transform', `translate(0, ${height + 6})`)
      .call(xAxis)
      .call((axis) => axis.select('.domain').remove())
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-family', 'JetBrains Mono');

    // Y Axis: Days
    const yAxis = d3.axisLeft(yScale).tickSize(0);

    g.append('g')
      .attr('transform', 'translate(-6, 0)')
      .call(yAxis)
      .call((axis) => axis.select('.domain').remove())
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('font-family', 'JetBrains Mono');

    // Render Heatmap Rectangles
    g.selectAll('rect.heatmap-cell')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d) => xScale(d.hour) || 0)
      .attr('y', (d) => yScale(d.day) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', (d) => colorScale(d.count))
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .transition()
      .duration(400)
      .delay((_, i) => (i % 24) * 15)
      .style('opacity', 1);

    // Event Handlers for Interactivity
    g.selectAll('rect.heatmap-cell')
      .on('mouseenter', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))');

        setSelectedCell(d as HeatmapCell);
        sounds.playClick();
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 1)
          .style('filter', 'none');
      });
  }, [heatmapData, maxCount]);

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-100">
              D3.js Interaction Heatmap: Peak Usage Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24-Hour hourly interaction density across weekdays to pinpoint peak assistant utilization windows.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
          {(
            [
              { id: 'all', label: '24 Hours' },
              { id: 'morning', label: 'Morning (6-12h)' },
              { id: 'afternoon', label: 'Afternoon (12-18h)' },
              { id: 'evening', label: 'Evening (18-6h)' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => {
                sounds.playClick();
                setActiveFilter(f.id);
              }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* D3 Heatmap Viewport */}
      <div ref={containerRef} className="w-full overflow-x-auto py-2">
        <svg ref={svgRef} className="w-full min-w-[700px] overflow-visible" />
      </div>

      {/* Heatmap Legend & Hover Inspector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
        {/* Dynamic Hover Inspector */}
        <div className="flex items-center gap-2 min-h-6">
          {selectedCell ? (
            <div className="flex items-center gap-3 text-slate-200 animate-fade-in">
              <span className="text-amber-400 font-bold">
                {selectedCell.day} at {selectedCell.hour}:00
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-sky-300 font-bold">
                {selectedCell.count} interactions
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{selectedCell.primaryTask}</span>
            </div>
          ) : (
            <span className="text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Hover over any cell to view hourly interaction breakdown
            </span>
          )}
        </div>

        {/* Color Scale Legend */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 text-[11px]">Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-xs" style={{ background: '#0a1628' }} />
            <span className="w-3.5 h-3.5 rounded-xs" style={{ background: '#0369a1' }} />
            <span className="w-3.5 h-3.5 rounded-xs" style={{ background: '#0ea5e9' }} />
            <span className="w-3.5 h-3.5 rounded-xs" style={{ background: '#10b981' }} />
            <span className="w-3.5 h-3.5 rounded-xs" style={{ background: '#f59e0b' }} />
          </div>
          <span className="text-amber-400 font-bold text-[11px]">More ({maxCount}+)</span>
        </div>
      </div>

      {/* Peak Window Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 block text-[11px]">Highest Peak Window:</span>
          <span className="text-amber-400 font-bold">
            {peakCell?.day} at {peakCell?.hour}:00 ({peakCell?.count} actions)
          </span>
        </div>
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 block text-[11px]">Weekday Peak Band:</span>
          <span className="text-sky-400 font-bold">14:00 - 17:00 (Engineering)</span>
        </div>
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 block text-[11px]">Night Background Quiet:</span>
          <span className="text-emerald-400 font-bold">01:00 - 05:00 (&lt; 5 commands)</span>
        </div>
      </div>
    </div>
  );
};
