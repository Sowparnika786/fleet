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
  // Live animated telemetry tick
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
      <div className="glass-panel rounded-2xl p-6 border border-[#e8dfd5]/10 animate-pulse">
        <div className="h-4 bg-[#1c222c] rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[#161b22] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 border border-[#e8dfd5]/12 relative overflow-hidden mb-8">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#10b981]/10 via-[#4a2545]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Live Status & Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e8dfd5]/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-mono flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#10b981]" />
            FLEET PULSE // LIVE TELEMETRICS
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 font-mono">
            SYNCED REAL-TIME
          </span>
        </div>

        {/* Live animated vehicle telemetry readouts */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-[#a3bdab] bg-[#0a0d13]/60 px-3 py-1 rounded-lg border border-[#e8dfd5]/5">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="text-white font-semibold">{simulatedSpeed}</span> km/h avg
          </span>
          <span className="h-3 w-px bg-[#34433a]" />
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-[#34d399]" />
            <span className="text-white font-semibold">89.4%</span> SoC
          </span>
          <span className="h-3 w-px bg-[#34433a]" />
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#dbb7db]" />
            <span className="text-white font-semibold">{simulatedTirePsi}</span> PSI
          </span>
        </div>
      </div>

      {/* Five Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-4">
        
        {/* KPI 1: Active Fleet Utilization */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#a3bdab] mb-1">
            <span>Fleet Utilization</span>
            <Activity className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">{pulseData.active_utilization_pct}%</span>
            <span className="text-[11px] text-[#7d9f88]">({pulseData.active_in_transit}/{pulseData.fleet_size})</span>
          </div>
          <div className="w-full bg-[#1c222c] h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#10b981] to-[#34d399] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, pulseData.active_utilization_pct)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Carbon Emissions Avoided */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#a3bdab] mb-1">
            <span>CO2e Avoided</span>
            <Leaf className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#34d399]">{pulseData.carbon_emissions_avoided_kg.toLocaleString()}</span>
            <span className="text-xs text-[#a3bdab]">kg</span>
          </div>
          <p className="text-[10px] text-[#7d9f88] mt-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> 100% Zero-Emissions Fleet
          </p>
        </div>

        {/* KPI 3: SLA On-Time Reliability */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#a3bdab] mb-1">
            <span>SLA On-Time Rate</span>
            <Clock className="w-3.5 h-3.5 text-[#d6c6b4]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#f4efea]">{pulseData.sla_on_time_rate_pct}%</span>
          </div>
          <p className="text-[10px] text-[#bea88e] mt-1">Guaranteed SLA Window</p>
        </div>

        {/* KPI 4: Driver Safety Index */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 hover:border-[#4a2545]/50 transition-all">
          <div className="flex items-center justify-between text-xs text-[#a3bdab] mb-1">
            <span>Avg Safety Index</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-white">{pulseData.average_safety_index}</span>
            <span className="text-xs text-[#a3bdab]">/100</span>
          </div>
          <p className="text-[10px] text-[#7d9f88] mt-1">Zero Serious Violations</p>
        </div>

        {/* KPI 5: Fatigue Headroom */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 hover:border-[#4a2545]/50 transition-all">
          <div className="flex items-center justify-between text-xs text-[#a3bdab] mb-1">
            <span>Avg Fatigue Index</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#dbb7db]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#dbb7db]">{pulseData.average_fatigue_index}</span>
            <span className="text-xs text-[#a3bdab]">/100</span>
          </div>
          <p className="text-[10px] text-[#a867a8] mt-1">Optimal Operator Readiness</p>
        </div>

      </div>

      {/* Active Alerts Pill Ticker */}
      <div className="flex items-center space-x-2 overflow-x-auto text-xs py-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-[#a3bdab] uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-[#10b981]" /> System Advisories:
        </span>
        {pulseData.active_alerts.map((alt) => {
          const isEmerald = alt.level === 'EMERALD';
          const isPlum = alt.level === 'PLUM';
          const bg = isEmerald ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#34d399]' :
                     isPlum ? 'bg-[#4a2545]/40 border-[#c48fc4]/30 text-[#f4eaf4]' :
                     'bg-[#d6c6b4]/10 border-[#bea88e]/30 text-[#e8dfd5]';
          return (
            <div key={alt.id} className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] whitespace-nowrap shrink-0 ${bg}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {alt.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
