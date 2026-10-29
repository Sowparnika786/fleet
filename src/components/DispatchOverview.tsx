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
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-rose-600 uppercase tracking-widest font-bold">
              CONCURRENCY LAB
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Double-Booking Attack Lab
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Stress-test high-concurrency race conditions live with 20+ simultaneous threads.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
            <span>Launch Stress Probe</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Hub 2: Fleet Time Machine */}
        <div 
          onClick={() => setActiveTab('time-machine')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">
              TEMPORAL AI
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Fleet Time Machine
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Interactive 48-hour past-to-future scrubber with battery depletion curves.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
            <span>Scrub Timeline</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Hub 3: Availability Heatmap */}
        <div 
          onClick={() => setActiveTab('heatmap')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">
              168-HR MATRIX
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Availability Heatmap
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            7-day x 24-hour capacity strain matrix identifying peak strain and idle pockets.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
            <span>Inspect Capacity</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Hub 4: Dispatch Black Box */}
        <div 
          onClick={() => setActiveTab('black-box')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-emerald-600" />
            </span>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold">
              SHA-256 CHAIN
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Dispatch Black Box
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Immutable flight-recorder audit trail with cryptographic tamper verification.
          </p>
          <div className="mt-4 flex items-center text-xs font-mono text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
            <span>Audit Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

      </div>

      {/* Main Split: Pending Consignments & Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Pending Urgent Consignments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
                  PENDING CARGO CONSIGNMENTS ({pendingDeliveries.length})
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('deliveries')}
                className="text-xs font-mono text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                View All Manifests →
              </button>
            </div>

            <div className="space-y-3">
              {pendingDeliveries.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No pending consignments.</p>
              ) : (
                pendingDeliveries.slice(0, 3).map((d) => (
                  <div 
                    key={d.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {d.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          d.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {d.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{d.title}</h4>
                      <p className="text-xs text-slate-500">{d.cargo_type} • {d.weight_kg}kg</p>
                    </div>

                    <button
                      onClick={() => onOpenSmartMatch(d)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Smart Match</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-mono">
            <span>Available Vehicles: <strong className="text-slate-900">{availableVehicles.length}</strong></span>
            <span>Available Drivers: <strong className="text-slate-900">{drivers.filter(dr => dr.status === 'Available').length}</strong></span>
          </div>
        </div>

        {/* Right Column: Active In-Transit Missions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
                  ACTIVE MISSIONS & PASSPORTS ({activeMissions.length})
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-mono text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Track All Missions →
              </button>
            </div>

            <div className="space-y-3">
              {activeMissions.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No active missions currently in transit.</p>
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Launch Guided Tour</span>
                  </button>
                </div>
              ) : (
                activeMissions.slice(0, 3).map((asn) => (
                  <div 
                    key={asn.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {asn.id}
                        </span>
                        <span className="text-xs text-slate-900 font-bold">{asn.vehicle_model}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Operator: {asn.driver_name} • Est. Arrival {new Date(asn.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewPassport(asn.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{asn.passport_score} pts</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-mono">
            <span>Guaranteed Zero Concurrency Collisions</span>
            <span className="text-emerald-700 font-bold">WAL Mode Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
