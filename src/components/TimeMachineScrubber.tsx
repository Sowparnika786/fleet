import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, RotateCcw, AlertTriangle, 
  BatteryCharging, MapPin, Truck
} from 'lucide-react';
import { fetchTimeMachineSnapshot } from '../api';
import { Vehicle } from '../types';

export const TimeMachineScrubber: React.FC = () => {
  const [offsetHours, setOffsetHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<{
    query_offset_hours: number;
    simulated_timestamp: string;
    fleet_size: number;
    simulated_vehicles: Vehicle[];
    active_assignments_count: number;
    bottlenecks: Array<{ time_slot: string; severity: string; message: string }>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadSnapshot = async (offset: number) => {
    setLoading(true);
    try {
      const data = await fetchTimeMachineSnapshot(offset);
      setSnapshot(data);
    } catch (err) {
      console.error('Time Machine snapshot error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshot(offsetHours);
  }, [offsetHours]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setOffsetHours((prev) => {
          if (prev >= 24) {
            setIsPlaying(false);
            return 24;
          }
          return Math.round((prev + 1) * 10) / 10;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatOffsetLabel = (hours: number) => {
    if (hours === 0) return 'NOW (Real-Time Live)';
    if (hours > 0) return `+${hours}h in Future (Simulation)`;
    return `${hours}h in Past (Historical Replay)`;
  };

  const formattedTimestamp = snapshot?.simulated_timestamp 
    ? new Date(snapshot.simulated_timestamp).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
      })
    : '--';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                FLEET TIME MACHINE // TEMPORAL SIMULATION
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Scrub across -24h to +24h to observe fleet trajectories, battery SoC curves, mission progress, and bottleneck forecasts.
            </p>
          </div>

          {/* Temporal Time Display Badge */}
          <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 flex flex-col items-start md:items-end">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              {formatOffsetLabel(offsetHours)}
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {formattedTimestamp}
            </span>
          </div>
        </div>

        {/* Interactive Scrubber Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold">
            <span>-24h (Past Shift)</span>
            <span className="text-emerald-700 font-bold">T = 0h (PRESENT)</span>
            <span>+24h (Simulation)</span>
          </div>

          {/* Range Slider */}
          <div className="relative flex items-center">
            <input
              type="range"
              min="-24"
              max="24"
              step="1"
              value={offsetHours}
              onChange={(e) => {
                setIsPlaying(false);
                setOffsetHours(parseFloat(e.target.value));
              }}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Control Buttons & Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            {/* Play/Pause & Reset */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
              </button>

              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(0); }}
                title="Reset to Present Live"
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-2 overflow-x-auto text-xs">
              <span className="text-[11px] text-slate-400 uppercase font-mono mr-1 font-semibold">Presets:</span>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(-12); }}
                className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
              >
                -12h Shift
              </button>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(0); }}
                className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold cursor-pointer"
              >
                Now Live
              </button>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(4); }}
                className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
              >
                +4h Peak
              </button>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(12); }}
                className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
              >
                +12h Tomorrow
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Bottlenecks & Predictive Advisories */}
      {snapshot?.bottlenecks && snapshot.bottlenecks.length > 0 && (
        <div className="space-y-2">
          {snapshot.bottlenecks.map((b, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center space-x-3 text-amber-900"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold font-mono mr-2 text-amber-800">[{b.time_slot} ADVISORY]:</span>
                <span>{b.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulated Fleet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            RECONSTRUCTED FLEET STATE // {snapshot?.simulated_vehicles?.length || 0} ASSETS
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Active Missions: <span className="text-slate-900 font-bold">{snapshot?.active_assignments_count || 0}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snapshot?.simulated_vehicles?.map((veh) => {
            const battery = veh.simulated_battery !== undefined ? veh.simulated_battery : veh.battery_fuel_pct;
            const lat = veh.simulated_lat !== undefined ? veh.simulated_lat : veh.current_location_lat;
            const lng = veh.simulated_lng !== undefined ? veh.simulated_lng : veh.current_location_lng;
            const isTransit = veh.status === 'In Transit';

            return (
              <div 
                key={veh.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {veh.plate_number}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{veh.model}</h4>
                    <p className="text-[11px] text-slate-500">{veh.category}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isTransit 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {veh.status}
                  </span>
                </div>

                {/* Simulated Telemetry Readings */}
                <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      Simulated Battery:
                    </span>
                    <span className="font-bold text-slate-900">{battery}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${battery}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Coordinates:
                    </span>
                    <span className="font-mono text-slate-800">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
