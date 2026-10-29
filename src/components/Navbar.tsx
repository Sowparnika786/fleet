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
    <header className="sticky top-0 z-40 border-b border-[#e8dfd5]/10 bg-[#0a0d13]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & System Status */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] via-[#047857] to-[#4a2545] p-0.5 shadow-lg shadow-[#10b981]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#10b981]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wider text-lg text-white font-mono">
                  FLEETWISE<span className="text-[#10b981]">.NEXUS</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1 animate-pulse" />
                  WAL ATOMIC
                </span>
              </div>
              <p className="text-[10px] text-[#a3bdab] tracking-widest uppercase">Autonomous Fleet Intelligence</p>
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#10b981]/15 text-[#e5ddd0] border border-[#10b981]/40 shadow-sm shadow-[#10b981]/10'
                      : 'text-[#a3bdab] hover:text-[#f4efea] hover:bg-[#1c222c]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#10b981]' : 'text-[#7d9f88]'}`} />
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
              className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#e8dfd5]/10 text-xs text-[#a3bdab] hover:border-[#10b981]/40 hover:text-white transition-all"
            >
              <Key className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="hidden md:inline font-mono text-[11px]">⌘K</span>
            </button>

            {/* Guided Demo Button */}
            <button
              onClick={onOpenDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4a2545] to-[#733c73] hover:from-[#5c2f5c] hover:to-[#8c4b8c] text-[#f4efea] text-xs font-semibold shadow-md shadow-[#4a2545]/30 border border-[#c48fc4]/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#e8dfd5]" />
              <span>Guided Demo</span>
            </button>

            {/* Reset Demo State */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset Demo Dataset"
              className="p-1.5 rounded-lg bg-[#161b22] border border-[#e8dfd5]/10 text-[#a3bdab] hover:text-[#e5ddd0] hover:border-[#10b981]/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-[#10b981]' : ''}`} />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-2 border-t border-[#e8dfd5]/5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#10b981]/15 text-white border border-[#10b981]/40'
                    : 'text-[#a3bdab] hover:text-white'
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
