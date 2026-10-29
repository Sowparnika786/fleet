import React from 'react';
import { 
  ShieldCheck, Clock, Zap, Flame, BarChart3, 
  Terminal, Compass, Truck, Users, Package, RefreshCw, Key
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
  onOpenDemo: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenDemo,
  onResetDemo,
  isResetting
}) => {
  const navItems = [
    { id: 'overview', label: 'Command Center', icon: Compass },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'deliveries', label: 'Deliveries', icon: Package },
    { id: 'assignments', label: 'Missions', icon: ShieldCheck },
    { id: 'time-machine', label: 'Time Machine', icon: Clock },
    { id: 'attack-lab', label: 'Attack Lab', icon: Flame },
    { id: 'heatmap', label: 'Heatmap', icon: BarChart3 },
    { id: 'black-box', label: 'Black Box', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & System Status */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 p-0.5 shadow-sm shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg text-slate-900 font-mono">
                  FLEETWISE<span className="text-emerald-600">.NEXUS</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  WAL ATOMIC
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">Autonomous Fleet Intelligence</p>
            </div>
          </div>

          {/* Center Navigation Bar */}
          <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2.5">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Ctrl+K or ⌘K)"
              className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 hover:border-emerald-400 hover:text-slate-900 transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline font-mono text-[11px] font-semibold">⌘K</span>
            </button>

            {/* Guided Demo Button */}
            <button
              onClick={onOpenDemo}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Guided Demo</span>
            </button>

            {/* Reset Demo State */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset Demo Dataset"
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-emerald-400 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-2 border-t border-slate-200 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
