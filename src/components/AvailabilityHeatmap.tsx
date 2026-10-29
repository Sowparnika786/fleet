import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { fetchHeatmap } from '../api';
import { AvailabilityHeatmapData, HeatmapSlot } from '../types';

export const AvailabilityHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<AvailabilityHeatmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; slot: HeatmapSlot } | null>(null);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const data = await fetchHeatmap();
      setHeatmapData(data);
      if (data.matrix.length > 0 && data.matrix[0].slots.length > 14) {
        setSelectedSlot({ day: data.matrix[0].day, slot: data.matrix[0].slots[14] });
      }
    } catch (err) {
      console.error('Heatmap load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCellColor = (strain: number) => {
    if (strain > 85) return 'bg-[#4a2545] border-[#c48fc4]/50 text-white hover:bg-[#733c73]'; // Critical Plum
    if (strain > 65) return 'bg-[#10b981]/70 border-[#10b981] text-white hover:bg-[#10b981]'; // Optimal Emerald
    if (strain > 40) return 'bg-[#62846d]/40 border-[#7d9f88]/40 text-[#f4efea] hover:bg-[#62846d]/70'; // Sage
    return 'bg-[#161b22] border-[#e8dfd5]/5 text-[#a3bdab] hover:bg-[#1c222c]'; // Low Sand/Stone
  };

  if (loading || !heatmapData) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-[#e8dfd5]/10 text-center animate-pulse">
        <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-[#a3bdab]">Generating 7-Day x 24-Hour Fleet Strain Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide font-mono">
                FLEET AVAILABILITY HEATMAP // 168-HOUR MATRIX
              </h2>
            </div>
            <p className="text-xs text-[#a3bdab] max-w-2xl leading-relaxed">
              Real-time multi-dimensional capacity strain analysis. Visualizes high-strain dispatch peaks, idle vehicle pockets, and predictive regional bottlenecks.
            </p>
          </div>

          {/* Legend Badges */}
          <div className="flex items-center space-x-3 text-[11px] font-mono bg-[#0b0e14] p-3 rounded-xl border border-[#e8dfd5]/10">
            <span className="flex items-center gap-1.5 text-[#a3bdab]">
              <span className="w-3 h-3 rounded bg-[#161b22] border border-[#e8dfd5]/10" /> Idle (&lt;40%)
            </span>
            <span className="flex items-center gap-1.5 text-[#a3bdab]">
              <span className="w-3 h-3 rounded bg-[#62846d]/40 border border-[#7d9f88]/40" /> Normal (40-65%)
            </span>
            <span className="flex items-center gap-1.5 text-[#34d399]">
              <span className="w-3 h-3 rounded bg-[#10b981]/70 border border-[#10b981]" /> Optimal (65-85%)
            </span>
            <span className="flex items-center gap-1.5 text-[#dbb7db]">
              <span className="w-3 h-3 rounded bg-[#4a2545] border border-[#c48fc4]/50" /> Peak (&gt;85%)
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 overflow-x-auto">
        <div className="min-w-[760px]">
          
          {/* Hour Headers (00 to 23) */}
          <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 mb-2 text-center text-[10px] font-mono text-[#a3bdab]">
            <div className="text-left font-bold pl-2">DAY / HR</div>
            {heatmapData.hours.map((h) => (
              <div key={h} className="text-center font-bold">
                {h.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Days Rows */}
          <div className="space-y-1.5">
            {heatmapData.matrix.map((row) => (
              <div key={row.day} className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 items-center">
                
                {/* Day Label */}
                <span className="text-xs font-semibold text-white pl-2 truncate font-mono">
                  {row.day}
                </span>

                {/* 24 Hour Slots */}
                {row.slots.map((slot) => {
                  const isSelected = selectedSlot?.day === row.day && selectedSlot?.slot.hour === slot.hour;
                  return (
                    <button
                      key={slot.hour}
                      onClick={() => setSelectedSlot({ day: row.day, slot })}
                      className={`h-7 rounded text-[9px] font-mono font-bold border transition-all flex items-center justify-center cursor-pointer ${getCellColor(
                        slot.strain_pct
                      )} ${isSelected ? 'ring-2 ring-white scale-110 z-10' : ''}`}
                      title={`${row.day} at ${slot.hour}:00 — Strain ${slot.strain_pct}%`}
                    >
                      {Math.round(slot.strain_pct)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Selected Slot Inspector Panel */}
      {selectedSlot && (
        <div className="glass-panel rounded-2xl p-5 border border-[#10b981]/30 bg-[#0b0e14]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-[#161b22] border border-[#e8dfd5]/10 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-bold font-mono text-white">
                {selectedSlot.slot.hour.toString().padStart(2, '0')}:00
              </span>
              <span className="text-[9px] font-mono text-[#7d9f88]">{selectedSlot.day.slice(0, 3)}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">
                  {selectedSlot.day} at {selectedSlot.slot.hour}:00 Window
                </h4>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  selectedSlot.slot.strain_pct > 85 ? 'bg-[#4a2545] text-[#f4eaf4]' :
                  selectedSlot.slot.strain_pct > 65 ? 'bg-[#10b981]/20 text-[#34d399]' :
                  'bg-[#1c222c] text-[#a3bdab]'
                }`}>
                  {selectedSlot.slot.status}
                </span>
              </div>
              <p className="text-xs text-[#a3bdab] mt-1">
                Projected Fleet Strain: <strong className="text-white font-mono">{selectedSlot.slot.strain_pct}%</strong> • Available Autonomous Reserves: <strong className="text-[#34d399] font-mono">{selectedSlot.slot.available_vehicles} Vehicles</strong>
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-[#7d9f88] shrink-0">
            <span>Historical Peak: <strong>{heatmapData.peak_hour}</strong></span>
            <br />
            <span>Optimal Window: <strong>{heatmapData.lowest_strain_slot}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
};
