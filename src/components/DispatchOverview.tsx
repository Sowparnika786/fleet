import React from 'react';
import { 
  Compass, Flame, Clock, BarChart3, Terminal, 
  ShieldCheck, ArrowRight, Zap, Truck, Package, Activity, Award
} from 'lucide-react';
import { Vehicle, Driver, Delivery, Assignment, FleetPulseData } from '../types';
import { FleetPulse } from './FleetPulse';

interface DispatchOverviewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  deliveries: Delivery[];
  assignments: Assignment[];
  pulseData: FleetPulseData | null;
  loading: boolean;
  setActiveTab: (tab: string) => void;
  onOpenSmartMatch: (delivery: Delivery) => void;
  onViewPassport: (assignmentId: string) => void;
  onOpenDemo: () => void;
}

export const DispatchOverview: React.FC<DispatchOverviewProps> = ({
  vehicles,
  drivers,
  deliveries,
  assignments,
  pulseData,
  loading,
  setActiveTab,
  onOpenSmartMatch,
  onViewPassport,
  onOpenDemo
}) => {
  const pendingDeliveries = deliveries.filter((d) => d.status === 'Pending');
  const activeMissions = assignments.filter((a) => a.status === 'In Progress' || a.status === 'Scheduled');
  const availableVehicles = vehicles.filter((v) => v.status === 'Available');

  return (
    <div className="space-y-8">
      
      {/* Real-Time Fleet Pulse Banner */}
      <FleetPulse pulseData={pulseData} loading={loading} />

      {/* Signature Intelligence Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Hub 1: Double-Booking Attack Lab */}
        <div 
          onClick={() => setActiveTab('attack-lab')}
          className="glass-panel-elevated p-5 rounded-2xl border border-red-500/30 hover:border-red-400 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
              CONCURRENCY LAB
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
            Double-Booking Attack Lab
          </h3>
          <p className="text-xs text-[#a3bdab] mt-1 line-clamp-2">
            Stress-test high-concurrency race conditions live with 20+ simultaneous threads.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-red-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Launch Stress Probe</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Hub 2: Fleet Time Machine */}
        <div 
          onClick={() => setActiveTab('time-machine')}
          className="glass-panel-elevated p-5 rounded-2xl border border-[#c48fc4]/30 hover:border-[#dbb7db] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-xl bg-[#4a2545]/60 border border-[#c48fc4]/40 text-[#dbb7db] group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-[#dbb7db] uppercase tracking-widest font-bold">
              TEMPORAL AI
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#dbb7db] transition-colors">
            Fleet Time Machine
          </h3>
          <p className="text-xs text-[#a3bdab] mt-1 line-clamp-2">
            Interactive 48-hour past-to-future scrubber with battery depletion trajectories.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-[#dbb7db] font-semibold group-hover:translate-x-1 transition-transform">
            <span>Scrub Timeline</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Hub 3: Availability Heatmap */}
        <div 
          onClick={() => setActiveTab('heatmap')}
          className="glass-panel-elevated p-5 rounded-2xl border border-[#10b981]/30 hover:border-[#34d399] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-[#34d399] uppercase tracking-widest font-bold">
              168-HR MATRIX
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#34d399] transition-colors">
            Availability Heatmap
          </h3>
          <p className="text-xs text-[#a3bdab] mt-1 line-clamp-2">
            7-day x 24-hour capacity strain matrix identifying peak strain and idle pockets.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-[#34d399] font-semibold group-hover:translate-x-1 transition-transform">
            <span>Inspect Capacity</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Hub 4: Dispatch Black Box */}
        <div 
          onClick={() => setActiveTab('black-box')}
          className="glass-panel-elevated p-5 rounded-2xl border border-[#e8dfd5]/20 hover:border-[#10b981] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-xl bg-[#161b22] border border-[#e8dfd5]/10 text-[#d6c6b4] group-hover:scale-110 transition-transform">
              <Terminal className="w-5 h-5 text-[#10b981]" />
            </span>
            <span className="text-[10px] font-mono text-[#a3bdab] uppercase tracking-widest font-bold">
              SHA-256 CHAIN
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
            Dispatch Black Box
          </h3>
          <p className="text-xs text-[#a3bdab] mt-1 line-clamp-2">
            Immutable flight-recorder audit trail with cryptographic tamper verification.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-[#10b981] font-semibold group-hover:translate-x-1 transition-transform">
            <span>Audit Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

      </div>

      {/* Main Split: Pending Consignments & Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Pending Urgent Consignments */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e8dfd5]/10">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-[#10b981]" />
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  PENDING CARGO CONSIGNMENTS ({pendingDeliveries.length})
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('deliveries')}
                className="text-xs font-mono text-[#34d399] hover:underline"
              >
                View All Manifests →
              </button>
            </div>

            <div className="space-y-3">
              {pendingDeliveries.length === 0 ? (
                <p className="text-xs text-[#a3bdab] py-8 text-center">No pending consignments.</p>
              ) : (
                pendingDeliveries.slice(0, 3).map((d) => (
                  <div 
                    key={d.id}
                    className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 flex items-center justify-between hover:border-[#10b981]/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b22] text-[#a3bdab]">
                          {d.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          d.priority === 'Urgent' ? 'bg-red-950/60 text-red-400' : 'bg-[#10b981]/15 text-[#34d399]'
                        }`}>
                          {d.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{d.title}</h4>
                      <p className="text-xs text-[#7d9f88]">{d.cargo_type} • {d.weight_kg}kg</p>
                    </div>

                    <button
                      onClick={() => onOpenSmartMatch(d)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white text-xs font-bold shadow-md shadow-[#10b981]/20 transition-all cursor-pointer shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Smart Match</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#e8dfd5]/10 text-xs text-[#7d9f88] flex items-center justify-between font-mono">
            <span>Available Vehicles: <strong className="text-white">{availableVehicles.length}</strong></span>
            <span>Available Drivers: <strong className="text-white">{drivers.filter(dr => dr.status === 'Available').length}</strong></span>
          </div>
        </div>

        {/* Right Column: Active In-Transit Missions */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e8dfd5]/10">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#dbb7db]" />
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  ACTIVE MISSIONS & PASSPORTS ({activeMissions.length})
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-mono text-[#dbb7db] hover:underline"
              >
                Track All Missions →
              </button>
            </div>

            <div className="space-y-3">
              {activeMissions.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-[#a3bdab]">No active missions currently in transit.</p>
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#4a2545] text-white text-xs font-semibold"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Launch Guided Tour</span>
                  </button>
                </div>
              ) : (
                activeMissions.slice(0, 3).map((asn) => (
                  <div 
                    key={asn.id}
                    className="p-3.5 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 flex items-center justify-between hover:border-[#10b981]/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b22] text-[#34d399]">
                          {asn.id}
                        </span>
                        <span className="text-xs text-white font-bold">{asn.vehicle_model}</span>
                      </div>
                      <p className="text-xs text-[#7d9f88] mt-1">
                        Operator: {asn.driver_name} • Est. Arrival {new Date(asn.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewPassport(asn.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#10b981]/40 text-[#34d399] hover:bg-[#10b981]/20 text-xs font-mono transition-all cursor-pointer shrink-0"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{asn.passport_score} pts</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#e8dfd5]/10 text-xs text-[#7d9f88] flex items-center justify-between font-mono">
            <span>Guaranteed Zero Concurrency Collisions</span>
            <span className="text-[#34d399]">WAL Mode Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
