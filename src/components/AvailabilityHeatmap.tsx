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
    if (strain > 85) return 'bg-emerald-700 border-emerald-800 text-white font-bold hover:bg-emerald-800'; // Peak High Emerald
    if (strain > 65) return 'bg-emerald-400 border-emerald-500 text-emerald-950 font-bold hover:bg-emerald-500'; // Optimal
    if (strain > 40) return 'bg-emerald-100 border-emerald-200 text-emerald-900 hover:bg-emerald-200'; // Normal
    return 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'; // Idle
  };

  if (loading || !heatmapData) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center animate-pulse shadow-xs">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-500">Generating 7-Day x 24-Hour Fleet Strain Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              FLEET AVAILABILITY HEATMAP // 168-HOUR MATRIX
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Real-time multi-dimensional capacity strain analysis. Visualizes high-strain dispatch peaks, idle vehicle pockets, and predictive regional bottlenecks.
          </p>
        </div>

        {/* Legend Badges */}
        <div className="flex items-center space-x-3 text-[11px] font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" /> Idle (&lt;40%)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Normal (40-65%)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <span className="w-3 h-3 rounded bg-emerald-400 border border-emerald-500" /> Optimal (65-85%)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-950 font-bold">
            <span className="w-3 h-3 rounded bg-emerald-700 border border-emerald-800" /> Peak (&gt;85%)
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs overflow-x-auto">
        <div className="min-w-[760px]">
          
          {/* Hour Headers (00 to 23) */}
          <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 mb-2 text-center text-[10px] font-mono text-slate-500">
            <div className="text-left font-bold pl-2 text-slate-700">DAY / HR</div>
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
                <span className="text-xs font-bold text-slate-800 pl-2 truncate font-mono">
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
                      )} ${isSelected ? 'ring-2 ring-emerald-600 scale-110 z-10' : ''}`}
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
        <div className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-bold font-mono text-slate-900">
                {selectedSlot.slot.hour.toString().padStart(2, '0')}:00
              </span>
              <span className="text-[9px] font-mono text-emerald-700 font-bold">{selectedSlot.day.slice(0, 3)}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedSlot.day} at {selectedSlot.slot.hour}:00 Window
                </h4>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  selectedSlot.slot.strain_pct > 85 ? 'bg-emerald-100 text-emerald-900' :
                  selectedSlot.slot.strain_pct > 65 ? 'bg-emerald-50 text-emerald-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedSlot.slot.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Projected Fleet Strain: <strong className="text-slate-900 font-mono">{selectedSlot.slot.strain_pct}%</strong> • Available Autonomous Reserves: <strong className="text-emerald-700 font-mono">{selectedSlot.slot.available_vehicles} Vehicles</strong>
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-500 shrink-0">
            <span>Historical Peak: <strong className="text-slate-800">{heatmapData.peak_hour}</strong></span>
            <br />
            <span>Optimal Window: <strong className="text-emerald-700 font-bold">{heatmapData.lowest_strain_slot}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
};
