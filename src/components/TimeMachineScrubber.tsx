import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, RotateCcw, AlertTriangle, 
  BatteryCharging, MapPin, Truck, ChevronRight, Zap
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

  // Load snapshot on offset change
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

  // Playback timer loop
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
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#4a2545]/50 border border-[#c48fc4]/30 text-[#f4eaf4]">
                <Clock className="w-4 h-4 text-[#dbb7db]" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide font-mono">
                FLEET TIME MACHINE // TEMPORAL SIMULATION
              </h2>
            </div>
            <p className="text-xs text-[#a3bdab] max-w-xl">
              Scrub across -24h to +24h to observe fleet trajectories, battery SoC curves, mission progress, and bottleneck forecasts.
            </p>
          </div>

          {/* Temporal Time Display Badge */}
          <div className="bg-[#0b0e14] px-4 py-2.5 rounded-xl border border-[#10b981]/30 flex flex-col items-start md:items-end">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#10b981]">
              {formatOffsetLabel(offsetHours)}
            </span>
            <span className="text-sm font-bold font-mono text-white mt-0.5">
              {formattedTimestamp}
            </span>
          </div>
        </div>

        {/* Interactive Scrubber Controls */}
        <div className="mt-8 pt-6 border-t border-[#e8dfd5]/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#a3bdab]">
            <span>-24h (Past Shift Log)</span>
            <span className="text-[#34d399] font-bold">T = 0h (PRESENT)</span>
            <span>+24h (Predictive Simulation)</span>
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
              className="w-full h-2.5 bg-[#1c222c] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
            />
          </div>

          {/* Control Buttons & Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            {/* Play/Pause & Reset */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-[#4a2545] text-white border border-[#c48fc4]/40' 
                    : 'bg-[#10b981] text-[#0b0e14] hover:bg-[#34d399]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
              </button>

              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(0); }}
                title="Reset to Present Live"
                className="p-1.5 rounded-lg bg-[#161b22] border border-[#e8dfd5]/10 text-[#a3bdab] hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-2 overflow-x-auto text-xs">
              <span className="text-[11px] text-[#7d9f88] uppercase font-mono mr-1">Presets:</span>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(-12); }}
                className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#e8dfd5]/10 text-xs text-[#e8dfd5] hover:border-[#10b981]/40"
              >
                -12h Shift
              </button>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(0); }}
                className="px-2.5 py-1 rounded-md bg-[#10b981]/20 border border-[#10b981]/40 text-xs text-[#34d399] font-semibold"
              >
                Now Live
              </button>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(4); }}
                className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#e8dfd5]/10 text-xs text-[#e8dfd5] hover:border-[#10b981]/40"
              >
                +4h Peak
              </button>
              <button
                onClick={() => { setIsPlaying(false); setOffsetHours(12); }}
                className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#e8dfd5]/10 text-xs text-[#e8dfd5] hover:border-[#10b981]/40"
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
              className="p-3.5 rounded-xl bg-[#4a2545]/30 border border-[#c48fc4]/30 text-xs flex items-center space-x-3 text-[#f4eaf4]"
            >
              <AlertTriangle className="w-4 h-4 text-[#dbb7db] shrink-0" />
              <div>
                <span className="font-bold font-mono mr-2 text-[#dbb7db]">[{b.time_slot} ADVISORY]:</span>
                <span>{b.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulated Fleet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#10b981]" />
            RECONSTRUCTED FLEET STATE // {snapshot?.simulated_vehicles?.length || 0} ASSETS
          </h3>
          <span className="text-xs text-[#a3bdab] font-mono">
            Active Missions: <span className="text-white font-bold">{snapshot?.active_assignments_count || 0}</span>
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
                className="glass-panel rounded-xl p-4 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#161b22] text-[#a3bdab] border border-[#e8dfd5]/10">
                      {veh.plate_number}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{veh.model}</h4>
                    <p className="text-[11px] text-[#7d9f88]">{veh.category}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isTransit 
                      ? 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/40' 
                      : 'bg-[#1c222c] text-[#a3bdab] border-[#e8dfd5]/10'
                  }`}>
                    {veh.status}
                  </span>
                </div>

                {/* Simulated Telemetry Readings */}
                <div className="space-y-2 text-xs pt-2 border-t border-[#e8dfd5]/5">
                  <div className="flex items-center justify-between text-[#a3bdab]">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#34d399]" />
                      Simulated Battery:
                    </span>
                    <span className="font-mono font-bold text-white">{battery}%</span>
                  </div>

                  <div className="w-full bg-[#1c222c] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        battery < 20 ? 'bg-red-500' : (battery < 50 ? 'bg-[#bea88e]' : 'bg-[#10b981]')
                      }`}
                      style={{ width: `${battery}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[#a3bdab] text-[11px] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#7d9f88]" />
                      Coordinates:
                    </span>
                    <span className="font-mono text-white">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
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
