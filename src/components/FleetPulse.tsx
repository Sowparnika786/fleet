import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Leaf, Clock, AlertTriangle, 
  BatteryCharging, Gauge, Radio, Sparkles
} from 'lucide-react';
import { FleetPulseData } from '../types';

interface FleetPulseProps {
  pulseData: FleetPulseData | null;
  loading: boolean;
}

export const FleetPulse: React.FC<FleetPulseProps> = ({ pulseData, loading }) => {
  const [telemetryTick, setTelemetryTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const simulatedSpeed = 62 + (telemetryTick % 7);
  const simulatedTirePsi = (36.2 + ((telemetryTick % 3) * 0.1)).toFixed(1);

  if (loading || !pulseData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
      {/* Top Header: Live Status & Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase font-mono flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            FLEET PULSE // LIVE TELEMETRICS
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-mono">
            SYNCED REAL-TIME
          </span>
        </div>

        {/* Live animated vehicle telemetry readouts */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-900 font-bold">{simulatedSpeed}</span> km/h avg
          </span>
          <span className="h-3 w-px bg-slate-300" />
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-900 font-bold">89.4%</span> SoC
          </span>
          <span className="h-3 w-px bg-slate-300" />
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-900 font-bold">{simulatedTirePsi}</span> PSI
          </span>
        </div>
      </div>

      {/* Five Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-4">
        
        {/* KPI 1: Active Fleet Utilization */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Fleet Utilization</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{pulseData.active_utilization_pct}%</span>
            <span className="text-[11px] text-slate-500">({pulseData.active_in_transit}/{pulseData.fleet_size})</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, pulseData.active_utilization_pct)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Carbon Emissions Avoided */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>CO2e Avoided</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-emerald-700">{pulseData.carbon_emissions_avoided_kg.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-bold">kg</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> 100% Zero-Emissions Fleet
          </p>
        </div>

        {/* KPI 3: SLA On-Time Reliability */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>SLA On-Time Rate</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{pulseData.sla_on_time_rate_pct}%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Guaranteed SLA Window</p>
        </div>

        {/* KPI 4: Driver Safety Index */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Safety Index</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{pulseData.average_safety_index}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Zero Incident Flags</p>
        </div>

        {/* KPI 5: Fatigue Headroom */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Fatigue Index</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{pulseData.average_fatigue_index}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Optimal Readiness</p>
        </div>

      </div>

      {/* Active Alerts Pill Ticker */}
      <div className="flex items-center space-x-2 overflow-x-auto text-xs py-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Advisories:
        </span>
        {pulseData.active_alerts.map((alt) => (
          <div key={alt.id} className="inline-flex items-center px-3 py-1 rounded-full border text-[11px] whitespace-nowrap shrink-0 bg-emerald-50 border-emerald-200 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
            {alt.text}
          </div>
        ))}
      </div>
    </div>
  );
};
