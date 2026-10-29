import React, { useState } from 'react';
import { Palette, Sparkles, Check } from 'lucide-react';

export const PaletteBanner: React.FC = () => {
  const [activeMood, setActiveMood] = useState<'CINEMATIC' | 'WARM_LUXURY'>('CINEMATIC');

  const swatches = [
    { name: 'SAGE', hex: '#728F79', rgb: '114, 143, 121', role: 'Botanical Readiness & Telemetry', textColor: '#adc2b1' },
    { name: 'SAND', hex: '#EADFC5', rgb: '234, 223, 197', role: 'Champagne Linen & Typography', textColor: '#f5efea' },
    { name: 'EMERALD', hex: '#10B981', rgb: '16, 185, 129', role: 'Verified Passports & Green Fleet', textColor: '#34d399' },
    { name: 'PLUM', hex: '#733C73', rgb: '115, 60, 115', role: 'Critical Missions & Concurrency', textColor: '#dbb7db' },
    { name: 'STONE', hex: '#1F2530', rgb: '31, 37, 48', role: 'Obsidian Slate & Glassmorphism', textColor: '#a3bdab' },
  ];

  return (
    <div className="mb-6 p-3 rounded-2xl bg-[#141922]/90 border border-[#eadfc5]/15 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Title & Palette Badge */}
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded-lg bg-[#eadfc5]/10 border border-[#eadfc5]/20 text-[#eadfc5]">
          <Palette className="w-4 h-4 text-[#eadfc5]" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#eadfc5] uppercase flex items-center gap-1.5">
            EXECUTIVE COLOR SYSTEM // 5-TONE LUXURY HARMONY
          </span>
          <p className="text-[11px] text-[#adc2b1]">
            Calibrated contrast: Sage, Sand, Emerald, Plum & Stone
          </p>
        </div>
      </div>

      {/* Swatches Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
        {swatches.map((s) => (
          <div 
            key={s.name}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0e1218] border border-[#eadfc5]/10 text-xs font-mono shrink-0 hover:border-[#eadfc5]/30 transition-all"
            title={`${s.name} (${s.hex}) — ${s.role}`}
          >
            <span 
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: s.hex }}
            />
            <span className="font-bold text-[11px]" style={{ color: s.textColor }}>
              {s.name}
            </span>
            <span className="text-[9px] text-[#7d9f88] hidden md:inline">
              {s.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
