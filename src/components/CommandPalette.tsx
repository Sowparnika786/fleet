import React, { useState, useEffect } from 'react';
import { 
  Search, X, Flame, Clock, ShieldCheck, Terminal, 
  BarChart3, RefreshCw, Zap, ArrowRight, Truck, Users, Package
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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
        }
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
    { id: 'attack-lab', title: 'Launch Double-Booking Attack Lab', category: 'Intelligence', icon: Flame, action: () => { setActiveTab('attack-lab'); onClose(); } },
    { id: 'demo', title: 'Start Guided Hackathon Demo Tour', category: 'Showcase', icon: Zap, action: () => { onOpenDemo(); onClose(); } },
    { id: 'time-machine', title: 'Open Fleet Time Machine Scrubber', category: 'Intelligence', icon: Clock, action: () => { setActiveTab('time-machine'); onClose(); } },
    { id: 'heatmap', title: 'Analyze Fleet Availability Heatmap', category: 'Analytics', icon: BarChart3, action: () => { setActiveTab('heatmap'); onClose(); } },
    { id: 'black-box', title: 'Audit Dispatch Black Box & Verify Chain', category: 'Security', icon: Terminal, action: () => { setActiveTab('black-box'); onClose(); } },
    { id: 'assignments', title: 'Inspect Mission Assignments & Safety Passports', category: 'Operations', icon: ShieldCheck, action: () => { setActiveTab('assignments'); onClose(); } },
    { id: 'vehicles', title: 'View Vehicle Fleet Registry', category: 'Registry', icon: Truck, action: () => { setActiveTab('vehicles'); onClose(); } },
    { id: 'drivers', title: 'Manage Drivers & Operators', category: 'Registry', icon: Users, action: () => { setActiveTab('drivers'); onClose(); } },
    { id: 'deliveries', title: 'Examine Deliveries Manifest', category: 'Registry', icon: Package, action: () => { setActiveTab('deliveries'); onClose(); } },
    { id: 'reset', title: 'Reset Demo State to Pristine Default', category: 'System', icon: RefreshCw, action: () => { onResetDemo(); onClose(); } },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div 
        className="glass-panel-elevated w-full max-w-xl rounded-2xl border border-[#e8dfd5]/20 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#e8dfd5]/10 bg-[#0a0d13]/80">
          <Search className="w-5 h-5 text-[#10b981] mr-3" />
          <input
            type="text"
            placeholder="Type a command, feature, or entity..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#f4efea] placeholder-[#7d9f88] focus:outline-none font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[#a3bdab] hover:text-white hover:bg-[#1c222c] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#a3bdab]">
              No matching commands found for "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1c222c]/80 group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#0b0e14] border border-[#e8dfd5]/8 group-hover:border-[#10b981]/40 text-[#10b981] transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#f4efea] group-hover:text-white transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#7d9f88] uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7d9f88] group-hover:text-[#10b981] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-[#e8dfd5]/8 bg-[#0a0d13]/50 flex items-center justify-between text-[11px] text-[#7d9f88] font-mono">
          <span>Navigation: Select to jump</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
