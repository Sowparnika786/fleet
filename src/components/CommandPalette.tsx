import React, { useState, useEffect } from 'react';
import { 
  Search, X, Flame, Clock, ShieldCheck, Terminal, 
  BarChart3, RefreshCw, Zap, ArrowRight, Truck, Users, Package, MapPin
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onOpenDemo: () => void;
  onResetDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenDemo,
  onResetDemo
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'live-map', title: 'Open Live Fleet Map // Geospatial Telemetry', category: 'Geospatial', icon: MapPin, action: () => { setActiveTab('live-map'); onClose(); } },
    { id: 'attack-lab', title: 'Launch Double-Booking Attack Lab', category: 'Intelligence', icon: Flame, action: () => { setActiveTab('attack-lab'); onClose(); } },
    { id: 'demo', title: 'Start Guided Demo Tour', category: 'Showcase', icon: Zap, action: () => { onOpenDemo(); onClose(); } },
    { id: 'time-machine', title: 'Open Fleet Time Machine Scrubber', category: 'Intelligence', icon: Clock, action: () => { setActiveTab('time-machine'); onClose(); } },
    { id: 'heatmap', title: 'Analyze Fleet Availability Heatmap', category: 'Analytics', icon: BarChart3, action: () => { setActiveTab('heatmap'); onClose(); } },
    { id: 'black-box', title: 'Audit Dispatch Black Box & Verify Chain', category: 'Security', icon: Terminal, action: () => { setActiveTab('black-box'); onClose(); } },
    { id: 'assignments', title: 'Inspect Missions & Safety Passports', category: 'Operations', icon: ShieldCheck, action: () => { setActiveTab('assignments'); onClose(); } },
    { id: 'vehicles', title: 'View Vehicle Fleet Registry', category: 'Registry', icon: Truck, action: () => { setActiveTab('vehicles'); onClose(); } },
    { id: 'drivers', title: 'Manage Drivers & Operators', category: 'Registry', icon: Users, action: () => { setActiveTab('drivers'); onClose(); } },
    { id: 'deliveries', title: 'Examine Deliveries Manifest', category: 'Registry', icon: Package, action: () => { setActiveTab('deliveries'); onClose(); } },
    { id: 'reset', title: 'Reset Demo State to Default', category: 'System', icon: RefreshCw, action: () => { onResetDemo(); onClose(); } },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-emerald-600 mr-3" />
          <input
            type="text"
            placeholder="Type a command, feature, or entity..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found for "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-emerald-700 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Select command to jump</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
